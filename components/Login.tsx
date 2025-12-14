import React, { useState } from 'react';
import { signIn, signUp } from '../services/authService';
import { Lock, User, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            if (isLoginMode) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('ایمیل یا رمز عبور اشتباه است.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('این ایمیل قبلا ثبت شده است.');
            } else if (err.code === 'auth/weak-password') {
                setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            } else {
                setError('خطایی رخ داد: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        {isLoginMode ? 'ورود به سیستم' : 'ثبت نام در سازیار'}
                    </h1>
                    <p className="text-gray-500">سامانه مدیریت هوشمند پروژه</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                                placeholder="name@company.com"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                                placeholder="••••••••"
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md flex justify-center items-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isLoginMode ? 'ورود به داشبورد' : 'ایجاد حساب کاربری'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <button 
                            type="button"
                            onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            {isLoginMode ? 'حساب کاربری ندارید؟ ثبت نام کنید' : 'قبلا ثبت نام کرده‌اید؟ وارد شوید'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};