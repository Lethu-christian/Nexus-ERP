import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
    User, Mail, Shield, LogOut, Settings, Calendar,
    RefreshCcw, ArrowLeft, WalletCards, FileText, FolderOpen,
    CheckCircle2, Clock, AlertCircle, ExternalLink, ChevronRight
} from 'lucide-react';

const WHATSAPP_NUMBER = "27678846390";

function cn(...classes) { return classes.filter(Boolean).join(' '); }

const Account = ({ session, onSignOut, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [purchasesLoading, setPurchasesLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // orders | billing

    useEffect(() => {
        if (session) {
            getProfile();
            fetchPurchases();
        }
    }, [session]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { user } = session;
            const metadata = user.user_metadata || {};
            const { data: profileData } = await supabase
                .from('profiles')
                .select('is_admin, full_name, avatar_url')
                .eq('id', user.id)
                .single();

            setProfile({
                email: user.email,
                name: profileData?.full_name || metadata.full_name || metadata.name || 'LCX Client',
                avatar: profileData?.avatar_url || metadata.avatar_url || metadata.picture,
                lastSignIn: new Date(user.last_sign_in_at).toLocaleDateString('en-ZA'),
                joined: new Date(user.created_at).toLocaleDateString('en-ZA'),
                isAdmin: profileData?.is_admin || false,
                userId: user.id,
            });
        } catch (err) {
            console.error('Profile error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchases = async () => {
        setPurchasesLoading(true);
        try {
            const { user } = session;
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (!error && data) setPurchases(data);
        } catch (err) {
            console.error('Purchases error:', err);
        } finally {
            setPurchasesLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        onSignOut?.();
    };

    const handleWhatsApp = (purchase) => {
        const msg = `Hello LCX STUDIOS! 🎉 I've made a payment of R${Number(purchase.amount).toLocaleString()} for this type of order: ${purchase.description}. Please respond to confirm my next steps. Ref: ${purchase.reference?.substring(0, 20)}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <RefreshCcw className="text-blue-500 animate-spin" size={32} />
            </div>
        );
    }

    const tabs = [
        { id: 'orders', label: 'Your Orders', icon: Calendar },
        { id: 'billing', label: 'Billing History', icon: WalletCards },
    ];

    return (
        <div className="min-h-screen bg-[#020617] pt-20 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* ---- LEFT: Profile Card ---- */}
                    <div className="md:col-span-1 space-y-5">
                        {/* Profile */}
                        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-700 text-center shadow-xl">
                            <div className="relative inline-block mb-6">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-blue-600/30 object-cover" />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-blue-500/10 border-4 border-blue-500/30 flex items-center justify-center text-blue-400">
                                        <User size={44} />
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 border-2 border-[#020617] text-white">
                                    <Shield size={14} />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                            <p className="text-slate-400 text-sm mb-6 flex items-center justify-center gap-2">
                                <Mail size={13} /> {profile.email}
                            </p>

                            {profile.isAdmin && (
                                <button
                                    onClick={() => window.location.href = '/admin'}
                                    className="w-full mb-3 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                                >
                                    Admin Dashboard <ChevronRight size={16} />
                                </button>
                            )}

                            <button
                                onClick={() => window.location.href = '/analyzer'}
                                className="w-full mb-3 py-3 rounded-xl bg-slate-800 text-blue-400 font-bold text-sm border border-blue-500/20 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={16} /> Access Analyzer
                            </button>

                            <button
                                onClick={handleSignOut}
                                className="w-full py-3 rounded-xl border border-slate-600 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-sm"
                            >
                                <LogOut size={16} /> Log Out
                            </button>
                        </div>

                        {/* Account Info */}
                        <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-700">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                                <Settings size={16} className="text-blue-500" /> Account Info
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span>Joined</span>
                                    <span className="text-white font-bold">{profile.joined}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Last Login</span>
                                    <span className="text-white font-bold">{profile.lastSignIn}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Total Orders</span>
                                    <span className="text-blue-400 font-black">{purchases.length}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Status</span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-wider">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ---- RIGHT: Orders & Billing ---- */}
                    <div className="md:col-span-2 space-y-5">
                        {/* Tabs */}
                        <div className="flex bg-slate-900 border border-slate-700 p-1 rounded-2xl gap-1">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                                            activeTab === tab.id ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}>
                                        <Icon size={16} /> {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="p-6 rounded-[2.5rem] bg-slate-900/50 border border-slate-700 backdrop-blur-md min-h-[300px]">
                                {purchasesLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <RefreshCcw className="animate-spin text-blue-500" size={28} />
                                    </div>
                                ) : purchases.length === 0 ? (
                                    <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-slate-700 text-slate-400">
                                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-bold text-white mb-1">No orders yet</p>
                                        <p className="text-sm">After you purchase a package, it will appear here.</p>
                                        <button onClick={onBack} className="mt-6 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all">
                                            Browse Packages
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {purchases.map((purchase) => (
                                            <motion.div
                                                key={purchase.id}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-blue-500/30 transition-all"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white leading-tight">{purchase.description}</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Ref: <span className="font-mono text-slate-300">{purchase.reference?.substring(0, 16)}…</span>
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {new Date(purchase.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="text-right">
                                                        <p className="font-black text-white text-lg">R{Number(purchase.amount).toLocaleString()}</p>
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                            purchase.status === 'success' ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400")}>
                                                            {purchase.status}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleWhatsApp(purchase)}
                                                        className="p-2 rounded-xl bg-green-600/10 text-green-400 hover:bg-green-600/20 transition-colors"
                                                        title="Chat on WhatsApp"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="p-6 rounded-[2.5rem] bg-slate-900/50 border border-slate-700 backdrop-blur-md min-h-[300px]">
                                {purchasesLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <RefreshCcw className="animate-spin text-blue-500" size={28} />
                                    </div>
                                ) : purchases.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <WalletCards size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold text-white mb-1">No billing history</p>
                                        <p className="text-sm">Your payment receipts will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-700">
                                                    <th className="pb-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                                                    <th className="pb-4 text-xs font-black uppercase tracking-widest text-slate-400">Description</th>
                                                    <th className="pb-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                                    <th className="pb-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {purchases.map(p => (
                                                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                                        <td className="py-4 text-sm text-slate-400">
                                                            {new Date(p.created_at).toLocaleDateString('en-ZA')}
                                                        </td>
                                                        <td className="py-4 text-sm font-bold text-white pr-4">{p.description}</td>
                                                        <td className="py-4 text-sm font-black text-white text-right">R{Number(p.amount).toLocaleString()}</td>
                                                        <td className="py-4 text-right">
                                                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                                                                p.status === 'success' ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400")}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Project Files placeholder */}
                        <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
                                    <FolderOpen size={22} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">Project Files</h4>
                                    <p className="text-slate-400 text-xs mt-0.5">Your deliverables will be shared here once your project is complete.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <button onClick={onBack} className="mt-10 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </div>
        </div>
    );
};

export default Account;
