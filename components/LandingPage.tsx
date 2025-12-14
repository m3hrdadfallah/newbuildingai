import React from 'react';
import { Link } from 'react-router-dom';
import { IconLogo } from './Icon';
import { Sparkles, Activity, Shield, BarChart3, Clock, Users, ArrowLeft, BrainCircuit, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <IconLogo className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">سازیار</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden sm:block">
              ورود به پنل
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              شروع رایگان
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            نسخه جدید با هوش مصنوعی جمنای (Gemini)
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            دستیار هوشمند <br className="hidden md:block" />
            <span className="gradient-text">ساخت و ساز</span> شما
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            سازیار اولین پلتفرم مدیریت پروژه ساختمانی است که با بهره‌گیری از هوش مصنوعی، ریسک‌ها را پیش‌بینی می‌کند، هزینه‌ها را مدیریت می‌کند و تاخیرات را به حداقل می‌رساند.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2">
              ساخت پروژه جدید
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 rounded-2xl font-bold transition-all">
              مشاهده دمو
            </button>
          </div>
        </div>
      </section>

      {/* AI Feature Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
              هوش مصنوعی در قلب پروژه
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              دیگر نگران محاسبات پیچیده و تحلیل داده‌ها نباشید. سازیار مثل یک مدیر پروژه ارشد، 24 ساعته پروژه شما را پایش می‌کند.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">تحلیل ریسک خودکار</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                شناسایی ریسک‌های مالی و زمانی قبل از وقوع. هوش مصنوعی تاخیرات ناشی از شرایط جوی یا کمبود منابع را پیش‌بینی می‌کند.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">شبیه‌سازی سناریو (What-If)</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                تاثیر افزایش قیمت سیمان یا تاخیر پیمانکار را بسنجید. با یک کلیک، سناریوهای مختلف را شبیه‌سازی کنید و بهترین تصمیم را بگیرید.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">کنترل هزینه هوشمند (EVM)</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                محاسبه لحظه‌ای شاخص‌های CPI و SPI. نمودار S-Curve پروژه را با یک نگاه بررسی کنید و از انحراف بودجه مطلع شوید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                ابزاری قدرتمند برای تمام ارکان ساخت
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">برای پیمانکاران</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      مدیریت دقیق مصالح، کاهش پرت منابع و مستندسازی تاخیرات برای دفاع از لایحه تاخیرات.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">برای مهندسین مشاور</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      تولید خودکار گزارش‌های پیشرفت فیزیکی و ریالی، بررسی صورت‌وضعیت‌ها با هوش مصنوعی.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">برای کارفرمایان</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      شفافیت مالی کامل، داشبورد مدیریتی لحظه‌ای و اطمینان از اتمام پروژه در زمان مقرر.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
               {/* Abstract UI Representation */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                      <div className="h-2 w-24 bg-gray-200 rounded"></div>
                      <div className="h-2 w-8 bg-green-100 rounded"></div>
                  </div>
                  <div className="space-y-2">
                      <div className="h-8 bg-blue-50 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-50 rounded w-full"></div>
                      <div className="h-8 bg-gray-50 rounded w-5/6"></div>
                  </div>
               </div>
               <div className="bg-slate-800 text-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-bold">تحلیل هوشمند جمنای</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                      "بر اساس الگوی مصرف فعلی، پروژه شما در بخش اسکلت‌بندی با کسری بودجه 15% مواجه خواهد شد. پیشنهاد می‌شود خرید میلگرد را تسریع کنید."
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-slate-900 py-16 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 inline-flex items-center justify-center p-3 bg-slate-800 rounded-full">
            <IconLogo className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">آینده ساخت و ساز را امروز تجربه کنید</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            به جمع هزاران مهندس و مدیر پروژه‌ای بپیوندید که با سازیار، هوشمندتر می‌سازند.
          </p>
          <div className="flex justify-center gap-4">
             <Link to="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors">
               شروع رایگان پروژه
             </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
             <p>© 1403 سازیار. تمامی حقوق محفوظ است.</p>
             <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">قوانین و مقررات</a>
                <a href="#" className="hover:text-white transition-colors">حریم خصوصی</a>
                <a href="#" className="hover:text-white transition-colors">تماس با ما</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};