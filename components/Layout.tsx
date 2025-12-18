
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, Activity, Briefcase, Zap, FileText, PieChart, LogOut, User as UserIcon, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Login } from './Login';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, logout, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Login />;
    }

    const isActive = (path: string) => location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white';

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 font-[Vazirmatn]">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 right-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-xl flex flex-col
                lg:static lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <Briefcase className="w-8 h-8 text-blue-400" />
                        <div>
                            <h1 className="text-xl font-bold tracking-wider">مدیر ساخت</h1>
                            <p className="text-xs text-slate-400">سیستم هوشمند پروژه</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <div className="text-xs text-slate-500 px-4 mb-2">مدیریت کلان</div>
                    <Link onClick={closeSidebar} to="/" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
                        <Home className="w-5 h-5" />
                        <span>داشبورد وضعیت</span>
                    </Link>
                    <Link onClick={closeSidebar} to="/specs" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/specs')}`}>
                        <FileText className="w-5 h-5" />
                        <span>مشخصات پروژه</span>
                    </Link>
                    
                    <div className="text-xs text-slate-500 px-4 mb-2 mt-4">برنامه‌ریزی و اجرا</div>
                    <Link onClick={closeSidebar} to="/tasks" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/tasks')}`}>
                        <Activity className="w-5 h-5" />
                        <span>فعالیت‌ها (WBS)</span>
                    </Link>
                    <Link onClick={closeSidebar} to="/resources" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/resources')}`}>
                        <Package className="w-5 h-5" />
                        <span>مدیریت منابع و هزینه</span>
                    </Link>
                    <Link onClick={closeSidebar} to="/gantt" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/gantt')}`}>
                        <BarChart2 className="w-5 h-5" />
                        <span>گانت چارت (MSP)</span>
                    </Link>

                    <div className="text-xs text-slate-500 px-4 mb-2 mt-4">گزارشات و تحلیل</div>
                    <Link onClick={closeSidebar} to="/reports" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/reports')}`}>
                        <PieChart className="w-5 h-5" />
                        <span>گزارشات و نمودار S</span>
                    </Link>
                    <Link onClick={closeSidebar} to="/simulation" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/simulation')}`}>
                        <Zap className="w-5 h-5" />
                        <span>شبیه‌سازی سناریو</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-400 mb-2">
                       <div className="flex items-center gap-2 mb-1 text-white">
                           <UserIcon className="w-4 h-4" />
                           <span className="truncate">{user?.name}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                           <span>{user?.role === 'Manager' ? 'مدیر' : 'کاربر عادی'}</span>
                           <Link onClick={closeSidebar} to="/profile" className="text-blue-400 hover:text-blue-300">پروفایل</Link>
                       </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-slate-800 py-2 rounded transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        خروج
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                            {location.pathname === '/' && 'داشبورد مدیریت'}
                            {location.pathname === '/tasks' && 'مدیریت فعالیت‌ها'}
                            {location.pathname === '/resources' && 'منابع و هزینه‌ها'}
                            {location.pathname === '/gantt' && 'زمان‌بندی (MSP)'}
                            {location.pathname === '/simulation' && 'تحلیل سناریو'}
                            {location.pathname === '/specs' && 'مشخصات پروژه'}
                            {location.pathname === '/reports' && 'گزارشات و S-Curve'}
                            {location.pathname === '/profile' && 'حساب کاربری'}
                            {location.pathname === '/upgrade' && 'ارتقا حساب'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 text-sm">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-600 hidden sm:inline">{user?.name}</span>
                    </div>
                </header>
                <div className="p-4 sm:p-6 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
};
