import React, { useState } from 'react';
import { signIn, registerWithEmail, resetPassword } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Check, User } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    
    // Form States
    const [fullName, setFullName] = useState(''); // New State for Full Name
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
            setError('این ایمیل قبلا ثبت شده است.');
        } else if (errorCode === 'auth/weak-password') {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
        } else if (errorCode === 'auth/too-many-requests') {
            setError('تعداد درخواست‌ها زیاد است. لطفا دقایقی دیگر تلاش کنید.');
        } else {
            setError(errorMessage || 'خطایی رخ داده است. لطفا اتصال اینترنت را بررسی کنید.');
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
                if (!fullName.trim()) {
                    throw new Error("لطفا نام و نام خانوادگی را وارد کنید.");
                }
                await registerWithEmail(email, password, fullName);
            } else if (mode === 'forgot') {
                await resetPassword(email);
                setSuccessMsg('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.');
                setLoading(false);
            }
        } catch (err: any) {
            // Handle manual validation errors
            if (err.message === "لطفا نام و نام خانوادگی را وارد کنید.") {
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
                        برای دسترسی به داشبورد وارد شوید
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 leading-relaxed"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
                {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2"><Check className="w-4 h-4 shrink-0" />{successMsg}</div>}

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Name Input - Only for Register */}
                    {mode === 'register' && (
                            <div className="relative">
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right"
                                placeholder="نام و نام خانوادگی (فارسی)"
                                required
                            />
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    )}

                    <div className="relative">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left dir-ltr"
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left dir-ltr"
                                placeholder="رمز عبور"
                                required
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className="text-left">
                            <button type="button" onClick={() => { setMode('forgot'); resetState(); }} className="text-xs text-blue-600 font-medium">رمز عبور را فراموش کردید؟</button>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                            mode === 'forgot' ? 'ارسال لینک بازیابی' : 
                            mode === 'register' ? 'ثبت نام' : 'ورود'
                        )}
                    </button>

                    {mode === 'forgot' && (
                        <button type="button" onClick={() => { setMode('login'); resetState(); }} className="w-full text-sm text-gray-500">بازگشت</button>
                    )}
                </form>

                {/* Toggle Register/Login */}
                {(mode === 'login' || mode === 'register') && (
                    <div className="text-center mt-6">
                        <button 
                            type="button"
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); resetState(); }}
                            className="text-sm text-slate-600 font-bold hover:text-blue-600"
                        >
                            {mode === 'login' ? 'حساب ندارید؟ ثبت نام کنید' : 'حساب دارید؟ وارد شوید'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};