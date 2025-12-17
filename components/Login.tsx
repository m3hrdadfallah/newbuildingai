import React, { useState } from 'react';
import { signIn, registerWithEmail, resetPassword, signInWithGoogle } from '../services/authService';
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
        console.error("Auth Error:", err);
        setLoading(false);
        const errorCode = err.code;

        if (errorCode === 'auth/network-request-failed') {
            setError('خطا در اتصال! لطفاً از DNSهای رفع تحریم (مثل Shecan.ir) استفاده کنید.');
        } else if (errorCode === 'auth/popup-closed-by-user') {
            setError('پنجره ورود گوگل بسته شد.');
        } else if (errorCode === 'auth/invalid-credential') {
            setError('ایمیل یا رمز عبور اشتباه است.');
        } else {
            setError('خطایی در سیستم رخ داد. لطفاً مجدداً تلاش کنید.');
        }
    };

    const handleGoogleLogin = async () => {
        resetState();
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            handleAuthError(err);
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
                if (!fullName.trim()) throw { message: "لطفا نام کامل را وارد کنید" };
                await registerWithEmail(email, password, fullName);
            } else if (mode === 'forgot') {
                await resetPassword(email);
                setSuccessMsg('لینک بازیابی به ایمیل شما ارسال شد.');
            }
        } catch (err: any) {
            handleAuthError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-[Vazirmatn] dir-rtl">
            <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-[26px] font-black text-[#0f172a] mb-2">
                         {mode === 'forgot' ? 'بازیابی رمز عبور' : mode === 'register' ? 'ثبت‌نام در سازیار' : 'ورود به سازیار'}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        {mode === 'register' ? 'به جمع مدیران پروژه بپیوندید' : 'برای دسترسی به داشبورد وارد شوید'}
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                </div>}
                
                {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-green-100 flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successMsg}
                </div>}

                {/* Google Button at the top as per screenshot */}
                {mode !== 'forgot' && (
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-gray-50 transition-all shadow-sm mb-8"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
                        ورود سریع با گوگل
                    </button>
                )}

                {mode !== 'forgot' && (
                    <div className="relative flex items-center gap-4 py-4 mb-4">
                        <div className="flex-1 h-px bg-gray-100"></div>
                        <span className="text-[11px] text-gray-400 font-bold whitespace-nowrap">یا استفاده از ایمیل</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'register' && (
                        <div className="relative">
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)} 
                                className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all text-slate-700 placeholder:text-slate-400" 
                                placeholder="نام و نام خانوادگی" 
                                required 
                            />
                            <UserIcon className="w-5 h-5 text-slate-400 absolute right-4 top-4" />
                        </div>
                    )}
                    
                    <div className="relative">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm dir-ltr text-right text-slate-700 placeholder:text-slate-400" 
                            placeholder="ایمیل" 
                            required 
                        />
                        <Mail className="w-5 h-5 text-slate-400 absolute right-4 top-4" />
                    </div>

                    {mode !== 'forgot' && (
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm dir-ltr text-right text-slate-700 placeholder:text-slate-400" 
                                placeholder="رمز عبور" 
                                required 
                            />
                            <Lock className="w-5 h-5 text-slate-400 absolute right-4 top-4" />
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="text-right">
                            <button 
                                type="button"
                                onClick={() => setMode('forgot')}
                                className="text-[12px] text-blue-600 hover:underline font-bold"
                            >
                                رمز عبور را فراموش کردید؟
                            </button>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-[#2563eb] text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-4 text-base"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'forgot' ? 'ارسال لینک بازیابی' : mode === 'register' ? 'ساخت حساب کاربری' : 'ورود به حساب')}
                    </button>
                </form>

                <div className="text-center mt-10 pt-4 border-t border-gray-50">
                    <p className="text-sm text-slate-400">
                        {mode === 'login' ? 'هنوز حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
                    </p>
                    <button 
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); resetState(); }}
                        className="text-sm text-blue-600 font-black hover:underline mt-2"
                    >
                        {mode === 'login' ? 'ساخت حساب جدید' : 'وارد شوید'}
                    </button>
                </div>
            </div>
        </div>
    );
};