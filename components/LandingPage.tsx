import React from 'react';
import { Link } from 'react-router-dom';
import { IconLogo } from './Icon';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-[Vazirmatn]">
      <div className="bg-white p-12 rounded-[40px] shadow-xl border border-gray-100 text-center max-w-lg w-full">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <IconLogo className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-4">به سازیار خوش آمدید</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">دستیار هوشمند مدیریت پروژه ساختمانی</p>
        
        <Link 
          to="/login" 
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 transition-all transform hover:scale-[1.02]"
        >
          ورود به پنل کاربری
        </Link>
      </div>
    </div>
  );
};