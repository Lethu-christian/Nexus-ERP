import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Github, Chrome, AlertCircle, ArrowLeft } from 'lucide-react';

const Auth = ({ defaultMode = 'login', onAuthSuccess, onBack }) => {
    const [isLogin, setIsLogin] = useState(defaultMode === 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Success! Please check your email for the confirmation link.');
            }
            onAuthSuccess?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative p-8 rounded-3xl bg-slate-900 border border-slate-500 shadow-2xl">
            <button
                onClick={onBack}
                className="absolute top-6 left-6 p-2 rounded-full bg-[#020617] hover:bg-slate-900 hover:text-white text-slate-400 transition-all"
            >
                <ArrowLeft size={18} />
            </button>

            <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4">
                    {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Join LCX STUDIOS'}
                </h2>
                <p className="text-slate-400">
                    {isLogin ? 'Login to manage your business systems' : 'Create an account to get started'}
                </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                            required
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
                </button>
            </form>

            <p className="mt-8 text-center text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                    type="button"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        navigate(isLogin ? '/register' : '/login', { replace: true });
                    }}
                    className="ml-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                    {isLogin ? 'Sign Up' : 'Login'}
                </button>
            </p>
        </div>
    );
};

export default Auth;
