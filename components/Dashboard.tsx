import React from 'react';
import { useAuth } from '../AuthContext';
import { Mail, User as UserIcon, LogOut, LayoutDashboard, Calendar, Zap } from 'lucide-react';
import { logoutUser } from '../auth';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[32px] p-8 text-white shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/20 border-4 border-slate-700 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
              ) : (
                user.displayName?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">سلام، {user.displayName}</h2>
              <div className="flex flex-col gap-2 opacity-80">
                <span className="flex items-center gap-2 text-sm bg-slate-700/50 px-3 py-1.5 rounded-xl w-fit">
                  <UserIcon className="w-4 h-4" /> نام: {user.displayName}
                </span>
                <span className="flex items-center gap-2 text-sm bg-slate-700/50 px-3 py-1.5 rounded-xl w-fit">
                  <Mail className="w-4 h-4" /> ایمیل: {user.email}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => logoutUser()}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 px-6 py-3 rounded-2xl font-bold hover:bg-red-500/20 transition-all border border-red-500/20"
          >
            <LogOut className="w-5 h-5" /> خروج از حساب
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-500" />
              وضعیت دیتابیس
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">شناسه کاربر</span>
                <span className="font-mono text-slate-600 text-[10px] select-all">{user.uid}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-400">پایگاه داده</span>
                <span className="text-green-600 font-bold">متصل (Cloud Firestore)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-center text-slate-400 italic text-center">
          دسترسی به بخش‌های پروژه از طریق منوی کناری امکان‌پذیر است.
        </div>

        <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-lg shadow-blue-200 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-300 fill-current" />
            <span className="font-black text-lg">هوش مصنوعی</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            آماده تحلیل نقشه‌ها و زمان‌بندی پروژه شما هستیم.
          </p>
        </div>
      </div>
    </div>
  );
};