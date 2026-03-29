import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, ShieldCheck, User, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WHATSAPP_NUMBER = '27678846390';

export default function YocoPayButton({ amountInCents, description, onSuccess, label, onLoginRequired }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle');
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const amountRand = `R${(amountInCents / 100).toFixed(0)}`;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
            const params = new URLSearchParams(window.location.search);
            const isReturning = params.get('yoco_return') === '1';
            const saved = JSON.parse(localStorage.getItem('pendingYocoPurchase') || '{}');
            if (isReturning && saved.checkoutId && saved.description === description) {
                verifyPayment(saved.checkoutId, saved.description, saved.userId);
            }
        });
    }, []);

    const handlePay = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            if (onLoginRequired) onLoginRequired();
            else alert('Please log in or register to make a purchase.');
            return;
        }
        setLoading(true);
        setStatus('initializing');
        try {
            const userId = session.user.id;
            const returnUrl = window.location.origin + window.location.pathname + '?yoco_return=1';
            const { data, error } = await supabase.functions.invoke('verify-yoco', {
                body: {
                    mode: 'create',
                    amountInCents,
                    successUrl: returnUrl,
                    metadata: { description }
                }
            });

            if (error) throw new Error(error.message || 'Failed to start payment.');
            if (!data?.success || !data?.redirectUrl) {
                throw new Error(data?.error || 'Could not initialize payment.');
            }

            localStorage.setItem('pendingYocoPurchase', JSON.stringify({
                checkoutId: data.checkoutId,
                description,
                amountInCents,
                userId,
            }));

            window.location.href = data.redirectUrl;
        } catch (err) {
            console.error('Yoco create error:', err);
            alert('Payment error: ' + err.message);
            setLoading(false);
            setStatus('idle');
        }
    };

    const verifyPayment = async (checkoutId, desc, userId) => {
        setStatus('verifying');
        setLoading(true);
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        try {
            const { data, error } = await supabase.functions.invoke('verify-yoco', {
                body: { mode: 'verify', checkoutId, description: desc, userId }
            });
            localStorage.removeItem('pendingYocoPurchase');
            setLoading(false);
            setStatus('idle');
            if (error || !data?.success) {
                alert('Payment verification failed: ' + (data?.error || error?.message || 'Unknown error'));
            } else {
                setSuccessData({ desc, amount: amountRand });
                if (onSuccess) onSuccess(data);
            }
        } catch (err) {
            console.error('Verify error:', err);
            alert('Verification error: ' + err.message);
            setLoading(false);
            setStatus('idle');
        }
    };

    if (successData) {
        const waMsg = `Hello LCX STUDIOS! 🎉 I've made a payment of ${successData.amount} for this type of order: ${successData.desc}. Please respond to confirm my next steps. Thank you!`;
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
        return (
            <div className="w-full rounded-3xl bg-green-950/40 border border-green-500/30 p-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle2 className="h-7 w-7" />
                    <span className="text-lg font-black">Payment Successful!</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    You paid <strong className="text-white">{successData.amount}</strong> for <strong className="text-white">{successData.desc}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full rounded-full bg-green-600 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-500 transition-all active:scale-95 shadow-lg"
                    >
                        <MessageCircle className="h-5 w-5" />
                        WhatsApp
                    </a>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-3 w-full rounded-full bg-blue-600 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all active:scale-95 shadow-lg"
                    >
                        <Zap className="h-5 w-5 fill-current" />
                        Use System
                    </button>
                </div>
            </div>
        );
    }

    if (isLoggedIn === false) {
        return (
            <button
                onClick={() => onLoginRequired ? onLoginRequired() : alert('Please log in to purchase.')}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-blue-600 px-8 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 hover:shadow-xl active:scale-95 shadow-lg"
            >
                <User className="h-5 w-5" />
                Login to Purchase
            </button>
        );
    }

    return (
        <div className="w-full space-y-3">
            <button
                onClick={handlePay}
                disabled={loading || isLoggedIn === null}
                className="w-full relative flex items-center justify-center gap-3 rounded-full bg-blue-600 px-8 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                {loading ? (
                    <RefreshCcw className="h-5 w-5 animate-spin" />
                ) : (
                    <Zap className="h-5 w-5 fill-current" />
                )}
                {status === 'verifying' ? 'Verifying...' : status === 'initializing' ? 'Starting...' : label || `Pay ${amountRand}`}
            </button>
        </div>
    );
}
