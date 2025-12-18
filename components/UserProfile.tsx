
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { User, CheckCircle, AlertTriangle, CreditCard, Crown, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatJalaliDate } from '../utils/helpers';

export const UserProfile: React.FC = () => {
    const { user, logout } = useAuth();
    const { currentProject } = useProject();

    if (!user) return null;

    const isPro = user.plan === 'Pro';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-800">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-slate-400 text-sm">@{user.username}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isPro ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' : 'bg-gray-700 text-gray-300'}`}>
                            {isPro ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {isPro ? 'اشتراک حرفه‌ای (Pro)' : 'اشتراک رایگان'}
                        </span>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Subscription Status */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">وضعیت اشتراک</h3>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 text-sm">پلن فعلی</span>
                            <span className="font-mono font-bold">{user.plan || 'Free'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 text-sm">تاریخ انقضا</span>
                            <span className="font-mono text-sm">
                                {user.subscriptionExpiry ? formatJalaliDate(user.subscriptionExpiry) : 'نامحدود (رایگان)'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-500 text-sm">سهمیه هوش مصنوعی (امروز)</span>
                            <span className="font-mono text-sm">
                                {user.quota?.used} / {user.quota?.limit} درخواست
                            </span>
                        </div>

                        {!isPro && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-bold mb-1">ارتقا به نسخه حرفه‌ای</p>
                                        <p className="text-xs text-yellow-700 mb-3 leading-relaxed">
                                            برای دسترسی به تحلیل مسیر بحرانی، شبیه‌سازی سناریو و گزارشات کامل، اشتراک خود را ارتقا دهید.
                                        </p>
                                        <Link to="/upgrade" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                            مشاهده پلن‌ها و ارتقا
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Account Settings */}
                    <div className="space-y-4">
                         <h3 className="font-bold text-gray-800 border-b pb-2">پروژه‌های فعال</h3>
                         <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                             <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                                 <CheckCircle className="w-5 h-5" />
                             </div>
                             <div>
                                 <h4 className="font-bold text-sm text-gray-800">{currentProject.name}</h4>
                                 <p className="text-xs text-gray-500">{currentProject.tasks.length} فعالیت ثبت شده</p>
                             </div>
                         </div>
                    </div>
                </div>
                
                <div className="p-4 bg-gray-50 border-t text-center">
                    <button onClick={logout} className="text-red-500 text-sm hover:underline">
                        خروج از حساب کاربری
                    </button>
                </div>
            </div>
        </div>
    );
};
