import React, { useState } from 'react';
import { signIn, registerWithEmail, resetPassword } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Check, User as UserIcon } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const resetState = () => {
        setError(null);
        setSuccessMsg(null);
        setLoading(false);
    };

    const handleAuthError = (err: any) => {
        setLoading(false);
        const errorCode = err.code;

        if (errorCode === 'auth/network-request-failed') {
            setError('اختلال در اتصال! لطفاً برای استفاده بدون VPN، از DNSهای شکن (178.22.122.100) استفاده کنید.');
        } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            setError('ایمیل یا رمز عبور اشتباه است.');
        } else if (errorCode === 'auth/email-already-in-use') {
            setError('این ایمیل قبلاً ثبت شده است.');
        } else {
            setError('خطای سیستمی رخ داد. لطفاً دوباره تلاش کنید.');
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        setLoading(true);
        try {
            if (mode === 'login') {
                await signIn(email, password);
            } else if (mode === 'register') {
                if (!fullName.trim()) throw { code: 'custom/no-name' };
                await registerWithEmail(email, password, fullName);
            } else if (mode === 'forgot') {
                await resetPassword(email);
                setSuccessMsg('لینک بازیابی به ایمیل شما ارسال شد.');
            }
        } catch (err: any) {
            if (err.code === 'custom/no-name') setError('لطفاً نام کامل خود را وارد کنید.');
            else handleAuthError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-[Vazirmatn] dir-rtl">
            <div className="bg-white p-8 sm:p-12 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] w-full max-w-md border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-[28px] font-black text-[#0f172a] mb-2">
                         {mode === 'forgot' ? 'بازیابی رمز' : mode === 'register' ? 'ثبت‌نام در سازیار' : 'ورود به سازیار'}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        برای دسترسی به داشبورد وارد شوید
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                </div>}
                
                {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-green-100 flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successMsg}
                </div>}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'register' && (
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)} 
                                className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all text-slate-700 placeholder:text-slate-400" 
                                placeholder="نام و نام خانوادگی" 
                                required 
                            />
                            <UserIcon className="w-5 h-5 text-slate-400 absolute right-4 top-4 transition-colors group-focus-within:text-blue-500" />
                        </div>
                    )}
                    
                    <div className="relative group">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm dir-ltr text-right text-slate-700 placeholder:text-slate-400" 
                            placeholder="ایمیل" 
                            required 
                        />
                        <Mail className="w-5 h-5 text-slate-400 absolute right-4 top-4 transition-colors group-focus-within:text-blue-500" />
                    </div>

                    {mode !== 'forgot' && (
                        <div className="relative group">
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm dir-ltr text-right text-slate-700 placeholder:text-slate-400" 
                                placeholder="رمز عبور" 
                                required 
                            />
                            <Lock className="w-5 h-5 text-slate-400 absolute right-4 top-4 transition-colors group-focus-within:text-blue-500" />
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="text-right">
                            <button 
                                type="button"
                                onClick={() => setMode('forgot')}
                                className="text-[12px] text-blue-600 hover:text-blue-700 font-bold"
                            >
                                رمز عبور را فراموش کردید؟
                            </button>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-[#2563eb] text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-4 text-base disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'forgot' ? 'ارسال لینک بازیابی' : mode === 'register' ? 'ثبت‌نام رایگان' : 'ورود به حساب')}
                    </button>
                </form>

                <div className="text-center mt-12 pt-6 border-t border-gray-50">
                    <p className="text-sm text-slate-400 mb-2 font-medium">
                        {mode === 'login' ? 'هنوز حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
                    </p>
                    <button 
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); resetState(); }}
                        className="text-sm text-blue-600 font-black hover:underline"
                    >
                        {mode === 'login' ? 'ساخت حساب جدید' : 'وارد شوید'}
                    </button>
                </div>
            </div>
        </div>
    );
};