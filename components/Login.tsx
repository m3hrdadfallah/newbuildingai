import React, { useState } from 'react';
import { signIn, registerWithEmail, resetPassword, signInWithGoogle } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Check, User as UserIcon, ArrowLeft } from 'lucide-react';

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
            setError('خطا در اتصال به سرور! اگر از VPN استفاده نمی‌کنید، لطفاً از DNSهای رفع تحریم (مثل Shecan یا 403.online) استفاده کنید.');
        } else if (errorCode === 'auth/popup-closed-by-user') {
            setError('پنجره ورود بسته شد.');
        } else if (errorCode === 'auth/invalid-credential') {
            setError('ایمیل یا رمز عبور اشتباه است.');
        } else {
            setError(`خطا: ${err.message}`);
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
                if (!fullName.trim()) throw new Error("لطفا نام کامل را وارد کنید.");
                await registerWithEmail(email, password, fullName);
            } else if (mode === 'forgot') {
                await resetPassword(email);
                setSuccessMsg('لینک بازیابی ارسال شد.');
            }
        } catch (err: any) {
            handleAuthError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-[Vazirmatn] dir-rtl">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">
                         {mode === 'forgot' ? 'بازیابی رمز عبور' : mode === 'register' ? 'ثبت‌نام در سازیار' : 'ورود به سازیار'}
                    </h1>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{error}</span>
                    </div>
                </div>}
                
                {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-6 text-xs font-bold border border-green-100">
                    <Check className="w-4 h-4 shrink-0" /> {successMsg}
                </div>}

                <div className="space-y-4">
                    {/* Google Login Button */}
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
                        ورود سریع با گوگل
                    </button>

                    <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-[10px] text-gray-400 uppercase">یا از طریق ایمیل</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === 'register' && (
                            <div className="relative">
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="نام و نام خانوادگی" required />
                                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                        )}
                        <div className="relative">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left dir-ltr" placeholder="ایمیل" required />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                        {mode !== 'forgot' && (
                            <div className="relative">
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left dir-ltr" placeholder="رمز عبور" required />
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'forgot' ? 'ارسال لینک' : mode === 'register' ? 'ثبت نام' : 'ورود به حساب')}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <button 
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); resetState(); }}
                            className="text-sm text-blue-600 font-bold hover:underline"
                        >
                            {mode === 'login' ? 'هنوز حساب ندارید؟ ثبت‌نام' : 'قبلاً عضو شده‌اید؟ ورود'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};