import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../auth';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await registerWithEmail(email, password, fullName);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError('خطایی در ورود رخ داد. اطلاعات را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError('ورود با حساب گوگل ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-[Vazirmatn] dir-rtl">
      <div className="bg-white p-10 rounded-[32px] shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">
          {isRegister ? 'ایجاد حساب کاربری' : 'خوش آمدید'}
        </h2>
        <p className="text-slate-400 text-sm mb-8 text-center">دستیار هوشمند مدیریت پروژه سازیار</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <input 
                type="text" 
                placeholder="نام کامل" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="w-full pr-12 pl-4 py-4 bg-[#eef2ff] rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
              <UserIcon className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
            </div>
          )}
          <div className="relative">
            <input 
              type="email" 
              placeholder="ایمیل" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pr-12 pl-4 py-4 bg-[#eef2ff] rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-left dir-ltr" 
            />
            <Mail className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
          </div>
          <div className="relative">
            <input 
              type="password" 
              placeholder="رمز عبور" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pr-12 pl-4 py-4 bg-[#eef2ff] rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-left dir-ltr" 
            />
            <Lock className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 flex justify-center items-center transition-all hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isRegister ? 'ثبت‌نام' : 'ورود به پنل')}
          </button>
        </form>

        <div className="relative flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-xs text-slate-400">یا ورود با</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        <button 
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-gray-200 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
          ورود با حساب گوگل
        </button>

        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-center mt-8 text-blue-600 font-bold text-sm hover:underline"
        >
          {isRegister ? 'قبلاً ثبت‌نام کرده‌اید؟ ورود' : 'حساب کاربری ندارید؟ ثبت‌نام کنید'}
        </button>
      </div>
    </div>
  );
};