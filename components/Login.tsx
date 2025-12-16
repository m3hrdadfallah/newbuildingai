import React, { useState } from 'react';
import { signIn, registerWithEmail, resetPassword } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Check, User as UserIcon, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    
    // Form States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // UX States
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const resetState = () => {
        setError(null);
        setSuccessMsg(null);
        setLoading(false);
    };

    // Helper for error messages
    const handleAuthError = (err: any) => {
        console.error("Auth Error Details:", err);
        setLoading(false);

        const errorCode = err.code;
        const errorMessage = err.message || '';

        if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            setError('ایمیل یا رمز عبور اشتباه است.');
        } else if (errorCode === 'auth/email-already-in-use') {
            setError('این ایمیل قبلا ثبت شده است. لطفا وارد شوید.');
        } else if (errorCode === 'auth/weak-password') {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
        } else if (errorCode === 'auth/too-many-requests') {
            setError('تعداد درخواست‌ها زیاد است. لطفا دقایقی دیگر تلاش کنید.');
        } else if (errorCode === 'auth/network-request-failed') {
            setError('خطا در اتصال به اینترنت. لطفا فیلترشکن یا اتصال خود را بررسی کنید.');
        } else if (errorCode === 'auth/operation-not-allowed') {
            setError('ورود با ایمیل در تنظیمات فایربیس فعال نشده است.');
        } else if (errorCode === 'auth/invalid-api-key') {
            setError('کلید API فایربیس نامعتبر است.');
        } else {
            // Show code for easier debugging
            setError(`خطای سیستمی: ${errorCode || errorMessage}`);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        setLoading(true);
        
        try {
            if (mode === 'login') {
                await signIn(email, password);
                // Redirect handles by AuthContext/Layout
            } else if (mode === 'register') {
                if (!fullName.trim()) {
                    throw new Error("لطفا نام و نام خانوادگی را وارد کنید.");
                }
                await registerWithEmail(email, password, fullName);
            } else if (mode === 'forgot') {
                if (!email) throw new Error("لطفا ایمیل را وارد کنید.");
                await resetPassword(email);
                setSuccessMsg('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.');
                setLoading(false);
            }
        } catch (err: any) {
            if (err.message === "لطفا نام و نام خانوادگی را وارد کنید." || err.message === "لطفا ایمیل را وارد کنید.") {
                setError(err.message);
                setLoading(false);
            } else {
                handleAuthError(err);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-[Vazirmatn]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">
                         {mode === 'forgot' ? 'بازیابی رمز عبور' : 
                         mode === 'register' ? 'ثبت‌نام در سازیار' : 'ورود به سازیار'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {mode === 'forgot' ? 'ایمیل خود را وارد کنید' : 'برای دسترسی به داشبورد وارد شوید'}
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-xs font-bold flex flex-col gap-1 border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>خطا:</span>
                    </div>
                    <span className="leading-relaxed">{error}</span>
                </div>}
                
                {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-6 text-xs font-bold flex items-center gap-2 border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4 shrink-0" />
                    {successMsg}
                </div>}

                {/* Email Form Only - No Google/Phone */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    
                    {/* Name Input - Only for Register */}
                    {mode === 'register' && (
                        <div className="relative">
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="نام و نام خانوادگی"
                                required
                            />
                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    )}

                    <div className="relative">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                            placeholder="name@example.com"
                            required
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    
                    {mode !== 'forgot' && (
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                                placeholder="رمز عبور"
                                required
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="text-left">
                            <button type="button" onClick={() => { setMode('forgot'); resetState(); }} className="text-xs text-blue-600 font-medium hover:underline">رمز عبور را فراموش کردید؟</button>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            mode === 'forgot' ? 'ارسال لینک بازیابی' : 
                            mode === 'register' ? 'ثبت نام رایگان' : 'ورود به حساب'
                        )}
                    </button>

                    {mode === 'forgot' && (
                        <button type="button" onClick={() => { setMode('login'); resetState(); }} className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 mt-2">
                            <ArrowLeft className="w-4 h-4" />
                            بازگشت به ورود
                        </button>
                    )}
                </form>

                {/* Separator */}
                {(mode === 'login' || mode === 'register') && (
                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-2">
                             {mode === 'login' ? 'هنوز حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
                        </p>
                        <button 
                            type="button"
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); resetState(); }}
                            className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                        >
                            {mode === 'login' ? 'ساخت حساب جدید' : 'وارد شوید'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};