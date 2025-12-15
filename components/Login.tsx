import React, { useState, useEffect } from 'react';
import { signIn, registerWithEmail, signInWithGoogle, setupRecaptcha, sendOtpToPhone, resetPassword } from '../services/authService';
import { Lock, Mail, AlertCircle, Loader2, Smartphone, Check, User, ChevronRight } from 'lucide-react';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

type AuthMethod = 'email' | 'phone';
type AuthMode = 'login' | 'register' | 'forgot' | 'verify-otp';

export const Login: React.FC = () => {
    const [method, setMethod] = useState<AuthMethod>('email');
    const [mode, setMode] = useState<AuthMode>('login');
    
    // Form States
    const [fullName, setFullName] = useState(''); // New State for Full Name
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    
    // UX States
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Clear Recaptcha when switching methods
    useEffect(() => {
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = undefined;
            } catch (e) {
                console.error("Recaptcha clear error", e);
            }
        }
    }, [method, mode]);

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
            console.error("Google Login Error:", err);
            setLoading(false);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('پنجره ورود بسته شد.');
            } else {
                setError('خطا در اتصال به گوگل.');
            }
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
                setSuccessMsg('لینک بازیابی رمز عبور ارسال شد.');
                setLoading(false);
            }
        } catch (err: any) {
            setLoading(false);
            if (err.code === 'auth/invalid-credential') setError('ایمیل یا رمز عبور اشتباه است.');
            else if (err.code === 'auth/email-already-in-use') setError('این ایمیل قبلا ثبت شده است.');
            else if (err.code === 'auth/weak-password') setError('رمز عبور ضعیف است.');
            else setError(err.message || 'خطایی رخ داده است.');
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        
        let formattedPhone = phoneNumber.trim();
        if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
        if (!formattedPhone.startsWith('+98')) formattedPhone = `+98${formattedPhone}`;

        if (formattedPhone.length < 12) {
            setError('شماره موبایل نامعتبر است.');
            return;
        }

        setLoading(true);
        try {
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = setupRecaptcha('recaptcha-container');
            }
            const result = await sendOtpToPhone(formattedPhone, window.recaptchaVerifier);
            setConfirmationResult(result);
            setMode('verify-otp');
            setLoading(false);
        } catch (err: any) {
            setLoading(false);
            console.error(err);
            setError('خطا در ارسال پیامک. لطفا مجدد تلاش کنید یا از ورود با گوگل استفاده کنید.');
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
        } catch (err: any) {
            setLoading(false);
            setError('کد وارد شده صحیح نیست.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-[Vazirmatn]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">
                        {mode === 'verify-otp' ? 'تایید شماره موبایل' : 
                         mode === 'forgot' ? 'بازیابی رمز عبور' : 
                         mode === 'register' ? 'ثبت‌نام در سازیار' : 'ورود به سازیار'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {mode === 'verify-otp' ? `کد ارسال شده به ${phoneNumber}` : 'برای دسترسی به داشبورد وارد شوید'}
                    </p>
                </div>

                <div id="recaptcha-container" className="flex justify-center mb-4"></div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}

                {/* Primary Methods: Google & Phone */}
                {(mode === 'login' || mode === 'register') && (
                    <div className="space-y-3 mb-6">
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex justify-center items-center gap-3 relative overflow-hidden group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.54z" /><path fill="#EA4335" d="M12 4.6c1.62 0 3.1.56 4.23 1.64l3.18-3.18C17.46 1.14 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            <span>ورود سریع با گوگل</span>
                        </button>

                        <button 
                            onClick={() => { setMethod(method === 'phone' ? 'email' : 'phone'); setError(null); }}
                            className={`w-full py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-3 border ${method === 'phone' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                            <Smartphone className="w-5 h-5" />
                            {method === 'phone' ? 'ورود با شماره موبایل' : 'ورود با شماره موبایل'}
                            {method !== 'phone' && <ChevronRight className="w-4 h-4 opacity-50 absolute left-4" />}
                        </button>
                    </div>
                )}

                {/* Separator */}
                {(mode === 'login' || mode === 'register') && (
                    <div className="relative flex py-2 items-center mb-6">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">یا استفاده از ایمیل</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                )}

                {/* Verification Form (OTP) */}
                {mode === 'verify-otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <input 
                            type="text" 
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full text-center text-2xl tracking-[0.5em] py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dir-ltr font-mono"
                            placeholder="------"
                            autoFocus
                        />
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تایید کد'}
                        </button>
                        <button type="button" onClick={() => { setMode('login'); setMethod('phone'); }} className="w-full text-sm text-gray-500 py-2">تغییر شماره</button>
                    </form>
                )}

                {/* Phone Form */}
                {(mode === 'login' || mode === 'register') && method === 'phone' && (
                    <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="relative" dir="ltr">
                            <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-mono">+98</span>
                            <input 
                                type="tel" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left font-mono text-lg"
                                placeholder="912 345 6789"
                                autoFocus
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'ارسال کد تایید'}
                        </button>
                        <button type="button" onClick={() => setMethod('email')} className="w-full text-sm text-gray-500">بازگشت به ایمیل</button>
                    </form>
                )}

                {/* Email Form */}
                {((mode === 'login' || mode === 'register') && method === 'email') || mode === 'forgot' ? (
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
                                mode === 'register' ? 'ثبت نام' : 'ورود با ایمیل'
                            )}
                        </button>

                        {mode === 'forgot' && (
                            <button type="button" onClick={() => { setMode('login'); resetState(); }} className="w-full text-sm text-gray-500">بازگشت</button>
                        )}
                    </form>
                ) : null}

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
            
            <script dangerouslySetInnerHTML={{__html: `if(typeof window.recaptchaVerifier === 'undefined') window.recaptchaVerifier = null;`}} />
        </div>
    );
};

declare global { interface Window { recaptchaVerifier: RecaptchaVerifier | undefined; } }