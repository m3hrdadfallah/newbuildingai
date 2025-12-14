import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import { Check, X, Shield, Star, Zap, CreditCard, Loader2, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UpgradePage: React.FC = () => {
    const { user, handleMockPayment } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setLoading(true);
        
        // Simulate API delay for Payment Gateway
        setTimeout(() => {
            // In a real app, this would redirect to https://idpay.ir/p/xyz
            // Here we simulate the callback directly
            handleMockPayment();
            setLoading(false);
            navigate('/payment/callback');
            setTimeout(() => navigate('/profile'), 2000);
        }, 2000);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">ارتقا به نسخه حرفه‌ای (Pro)</h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    با فعال‌سازی اشتراک حرفه‌ای، قدرت هوش مصنوعی را در مدیریت پروژه خود آزاد کنید. 
                    تحلیل ریسک، نمودار S-Curve و شبیه‌سازی سناریو تنها بخشی از امکانات نسخه Pro است.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gray-100 px-4 py-1 rounded-bl-xl text-xs font-bold text-gray-500">
                        نسخه فعلی
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">رایگان (Free)</h3>
                    <div className="text-3xl font-bold text-slate-900 mb-6">
                        0 <span className="text-sm font-normal text-gray-500">تومان / ماهانه</span>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm text-gray-600">
                            <Check className="w-5 h-5 text-green-500" />
                            تعریف نامحدود فعالیت‌ها (WBS)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600">
                            <Check className="w-5 h-5 text-green-500" />
                            گانت چارت پایه
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600">
                            <Check className="w-5 h-5 text-green-500" />
                            مدیریت منابع ساده
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600">
                            <Check className="w-5 h-5 text-green-500" />
                            اعتبارسنجی فعالیت با AI (محدود)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-400 opacity-50">
                            <X className="w-5 h-5" />
                            چت هوشمند و تحلیل ریسک
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-400 opacity-50">
                            <X className="w-5 h-5" />
                            شبیه‌سازی سناریو (What-If)
                        </li>
                    </ul>

                    <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold cursor-not-allowed">
                        طرح فعال
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 p-8 flex flex-col relative overflow-hidden transform md:scale-105 z-10">
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1 rounded-br-xl text-xs font-bold text-black flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-current" />
                        پیشنهاد ویژه
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        حرفه‌ای (Pro)
                        <Crown className="w-5 h-5 text-yellow-400" />
                    </h3>
                    <div className="text-3xl font-bold text-white mb-6">
                        99,000 <span className="text-sm font-normal text-slate-400">تومان / ماهانه</span>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold text-white">دستیار هوشمند Gemini Pro</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            محاسبه خودکار مسیر بحرانی (CPM)
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            شبیه‌سازی سناریوهای مالی و زمانی
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            نمودار S-Curve و تحلیل انحراف
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            برآورد هوشمند مصالح و منابع
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            خروجی PDF و اکسل پیشرفته
                        </li>
                    </ul>

                    <button 
                        onClick={handleUpgrade}
                        disabled={loading || user?.plan === 'Pro'}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                در حال انتقال به درگاه...
                            </>
                        ) : user?.plan === 'Pro' ? (
                            'اشتراک فعال است'
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                ارتقا و پرداخت آنلاین
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                        پرداخت امن از طریق درگاه IDPay
                    </p>
                </div>
            </div>

            <div className="mt-16 bg-blue-50 rounded-2xl p-8 max-w-4xl mx-auto border border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-blue-900 mb-2">ضمانت بازگشت وجه</h4>
                        <p className="text-blue-800 text-sm leading-relaxed">
                            ما به کارایی هوش مصنوعی در پروژه شما اطمینان داریم. در صورت عدم رضایت از عملکرد سیستم در ۷ روز اول، تمام مبلغ پرداختی بدون قید و شرط عودت داده خواهد شد.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};