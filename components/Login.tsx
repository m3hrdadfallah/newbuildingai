import React, { useState, useEffect } from 'react';
import { signIn, signUp, signInWithGoogle, setupRecaptcha, sendOtpToPhone, resetPassword } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Smartphone, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

type AuthMethod = 'email' | 'phone';
type AuthMode = 'login' | 'register' | 'forgot' | 'verify-otp';

export const Login: React.FC = () => {
    const [method, setMethod] = useState<AuthMethod>('email');
    const [mode, setMode] = useState<AuthMode>('login');
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    
    // UX States
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Initial check for recaptcha cleanup
    useEffect(() => {
        // Cleanup function if needed
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
        };
    }, []);

    const resetState = () => {
        setError(null);
        setSuccessMsg(null);
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        resetState();
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error(err);
            setError('خطا در ورود با گوگل. لطفا مجدد تلاش کنید.');
            setLoading(false);
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
                await signUp(email, password);
            } else if (mode === 'forgot') {
                await resetPassword(email);
                setSuccessMsg('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('ایمیل یا رمز عبور اشتباه است.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('این ایمیل قبلا ثبت شده است.');
            } else if (err.code === 'auth/weak-password') {
                setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            } else {
                setError('خطایی رخ داد: ' + err.message);
            }
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        
        // Normalize phone number for Iran
        let formattedPhone = phoneNumber.trim();
        // Remove leading 0 if exists
        if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
        // Ensure +98 prefix
        if (!formattedPhone.startsWith('+98')) formattedPhone = `+98${formattedPhone}`;

        if (formattedPhone.length < 12) {
            setError('شماره موبایل نامعتبر است.');
            return;
        }

        setLoading(true);

        try {
            // Setup invisible recaptcha
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = setupRecaptcha('recaptcha-container');
            }
            const appVerifier = window.recaptchaVerifier;
            const result = await sendOtpToPhone(formattedPhone, appVerifier);
            setConfirmationResult(result);
            setMode('verify-otp');
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            setError('خطا در ارسال پیامک. لطفا شماره را بررسی کنید یا دقایقی دیگر تلاش کنید.');
            // Reset recaptcha on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = undefined;
            }
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        if (!confirmationResult) return;

        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            // Auth state change will handle redirect
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            setError('کد وارد شده اشتباه است.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-[Vazirmatn]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 relative">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                        {mode === 'verify-otp' ? 'تایید شماره موبایل' : 
                         mode === 'forgot' ? 'بازیابی رمز عبور' :
                         mode === 'register' ? 'ایجاد حساب کاربری' : 'ورود به سازیار'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {mode === 'verify-otp' ? `کد ارسال شده به ${phoneNumber} را وارد کنید` : 
                         mode === 'forgot' ? 'ایمیل خود را برای دریافت لینک بازیابی وارد کنید' :
                         'سامانه مدیریت هوشمند پروژه ساختمانی'}
                    </p>
                </div>

                {/* Tabs (Only show in login/register mode) */}
                {(mode === 'login' || mode === 'register') && (
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button 
                            onClick={() => { setMethod('email'); setError(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${method === 'email' ? 'bg-white shadow text-slate-800' : 'text-gray-500'}`}
                        >
                            <Mail className="w-4 h-4" />
                            ایمیل
                        </button>
                        <button 
                            onClick={() => { setMethod('phone'); setError(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${method === 'phone' ? 'bg-white shadow text-slate-800' : 'text-gray-500'}`}
                        >
                            <Smartphone className="w-4 h-4" />
                            شماره موبایل
                        </button>
                    </div>
                )}

                {/* Messages */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-6 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                        <Check className="w-4 h-4 shrink-0" />
                        {successMsg}
                    </div>
                )}

                {/* Google Button (Only in Login/Register Email/Phone Mode) */}
                {(mode === 'login' || mode === 'register') && (
                    <div className="mb-6">
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 text-sm"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.54z" />
                                        <path fill="#EA4335" d="M12 4.6c1.62 0 3.1.56 4.23 1.64l3.18-3.18C17.46 1.14 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    ورود با حساب گوگل
                                </>
                            )}
                        </button>
                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">یا ورود با</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                    </div>
                )}

                {/* --- Forms --- */}

                {/* 1. OTP Verification Form */}
                {mode === 'verify-otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div dir="ltr">
                            <input 
                                type="text" 
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full text-center text-2xl tracking-[0.5em] py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                                placeholder="------"
                                autoFocus
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || otp.length < 6}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-blue-900/10 flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تایید و ورود'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setMode('login'); setMethod('phone'); resetState(); }}
                            className="w-full text-sm text-gray-500 hover:text-gray-800 py-2"
                        >
                            تغییر شماره
                        </button>
                    </form>
                )}

                {/* 2. Phone Input Form */}
                {(mode === 'login' || mode === 'register') && method === 'phone' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">شماره موبایل</label>
                            <div className="relative" dir="ltr">
                                <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-mono">+98</span>
                                <input 
                                    type="tel" 
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-lg"
                                    placeholder="912 345 6789"
                                />
                                <Smartphone className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                            </div>
                        </div>
                        
                        <div id="recaptcha-container"></div>

                        <button 
                            type="submit" 
                            disabled={loading || phoneNumber.length < 10}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-blue-900/10 flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ارسال کد تایید'}
                        </button>
                    </form>
                )}

                {/* 3. Email Password Form */}
                {(mode === 'login' || mode === 'register') && method === 'email' && (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">ایمیل</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                                    placeholder="name@company.com"
                                />
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">رمز عبور</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                                    placeholder="••••••••"
                                />
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                            {mode === 'login' && (
                                <div className="text-left mt-2">
                                    <button 
                                        type="button"
                                        onClick={() => { setMode('forgot'); resetState(); }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        رمز عبور را فراموش کرده‌اید؟
                                    </button>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-blue-900/10 flex justify-center items-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {mode === 'login' ? 'ورود به داشبورد' : 'ثبت نام رایگان'}
                        </button>
                    </form>
                )}

                {/* 4. Forgot Password Form */}
                {mode === 'forgot' && (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">ایمیل خود را وارد کنید</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                                    placeholder="name@company.com"
                                />
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    ارسال لینک بازیابی
                                </>
                            )}
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setMode('login'); resetState(); }}
                            className="w-full flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-900 py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            بازگشت به صفحه ورود
                        </button>
                    </form>
                )}
                
                {/* Footer Toggle (Login/Register) */}
                {(mode === 'login' || mode === 'register') && (
                    <div className="text-center mt-6">
                        <button 
                            type="button"
                            onClick={() => { 
                                setMode(mode === 'login' ? 'register' : 'login'); 
                                resetState(); 
                            }}
                            className="text-sm text-slate-600 hover:text-blue-600 font-bold transition-colors"
                        >
                            {mode === 'login' ? 'حساب کاربری ندارید؟ ثبت نام کنید' : 'قبلا ثبت نام کرده‌اید؟ وارد شوید'}
                        </button>
                    </div>
                )}

            </div>
            
            {/* Global Recaptcha Window Type Def */}
            <script dangerouslySetInnerHTML={{__html: `
                window.recaptchaVerifier = null;
            `}} />
        </div>
    );
};

// Extend Window interface for Recaptcha
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}