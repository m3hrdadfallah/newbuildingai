import React, { useState } from 'react';
import { signIn, registerWithEmail, resetPassword, signInWithGoogle } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Check, User as UserIcon } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('register');
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
            setError('خطا در اتصال به سرور! اگر از VPN استفاده نمی‌کنید، لطفاً از DNSهای رفع تحریم (مثل Shecan.ir یا 403.online) استفاده کنید.');
        } else if (errorCode === 'auth/popup-closed-by-user') {
            setError('پنجره ورود گوگل بسته شد.');
        } else if (errorCode === 'auth/invalid-credential') {
            setError('ایمیل یا رمز عبور اشتباه است.');
        } else if (errorCode === 'auth/email-already-in-use') {
            setError('این ایمیل قبلاً ثبت شده است.');
        } else {
            setError('خطایی در سیستم رخ داد. لطفاً اتصال اینترنت خود را بررسی کنید.');
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
            <div className="bg-white p-8 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-[28px] font-black text-slate-900 mb-2">
                         {mode === 'forgot' ? 'بازیابی رمز عبور' : mode === 'register' ? 'ثبت‌نام در سازیار' : 'ورود به سازیار'}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {mode === 'register' ? 'برای دسترسی به داشبورد وارد شوید' : 'خوش آمدید، لطفاً وارد حساب خود شوید'}
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                </div>}
                
                {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-green-100 flex items-center gap-2">
                    <Check className="w-4 h-4" /> {successMsg}
                </div>}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'register' && (
                        <div className="relative">
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)} 
                                className="w-full pl-4 pr-12 py-4 bg-[#f8fafc] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all" 
                                placeholder="نام و نام خانوادگی" 
                                required 
                            />
                            <UserIcon className="w-5 h-5 text-gray-400 absolute right-4 top-4.5" />
                        </div>
                    )}
                    
                    <div className="relative">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm dir-ltr text-right" 
                            placeholder="ایمیل" 
                            required 
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute right-4 top-4.5" />
                    </div>

                    {mode !== 'forgot' && (
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full pl-4 pr-12 py-4 bg-[#eef2ff] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm dir-ltr text-right" 
                                placeholder="رمز عبور" 
                                required 
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute right-4 top-4.5" />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-[#2563eb] text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-4 text-base"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'forgot' ? 'ارسال لینک' : mode === 'register' ? 'ثبت نام رایگان' : 'ورود به حساب')}
                    </button>
                </form>

                <div className="relative flex items-center gap-4 py-8">
                    <div className="flex-1 h-px bg-gray-100"></div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">یا</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm mb-6"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
                    ورود با اکانت گوگل
                </button>

                <div className="text-center pt-2 border-t border-gray-50">
                    <p className="text-xs text-gray-400 mb-2">
                        {mode === 'login' ? 'هنوز ثبت‌نام نکرده‌اید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
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