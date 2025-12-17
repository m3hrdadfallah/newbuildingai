import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, BarChart2, Activity, Zap, FileText, PieChart, LogOut, User as UserIcon, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { logoutUser } from '../auth';
import { IconLogo } from './Icon';
import { AIChat } from './AIChat';

export const Layout: React.FC = () => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) return null;

    const isActive = (path: string) => location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white';

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 font-[Vazirmatn]">
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            <aside className={`
                fixed inset-y-0 right-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-xl flex flex-col
                lg:static lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <IconLogo className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-wider">سازیار</h1>
                            <p className="text-[10px] text-slate-400">دستیار هوشمند ساخت</p>
                        </div>
                    </div>
                    <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <Link onClick={closeSidebar} to="/dashboard" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard')}`}>
                        <Home className="w-5 h-5" />
                        <span>داشبورد وضعیت</span>
                    </Link>
                    <Link onClick={closeSidebar} to="/tasks" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/tasks')}`}>
                        <Activity className="w-5 h-5" />
                        <span>فعالیت‌ها (WBS)</span>
                    </Link>
                    <Link onClick={closeSidebar} to="/resources" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/resources')}`}>
                        <Package className="w-5 h-5" />
                        <span>منابع و هزینه</span>
                    </Link>
                    <Link onClick={closeSidebar} to="/gantt" className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${isActive('/gantt')}`}>
                        <BarChart2 className="w-5 h-5" />
                        <span>گانت چارت</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-400 mb-2">
                       <div className="flex items-center gap-2 mb-1 text-white font-bold">
                           <UserIcon className="w-4 h-4" />
                           <span className="truncate">{user?.displayName}</span>
                       </div>
                    </div>
                    <button 
                        onClick={() => logoutUser()}
                        className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-slate-800 py-2 rounded transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        خروج
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {location.pathname === '/dashboard' ? 'پنل کاربری' : 'مدیریت پروژه'}
                        </h2>
                    </div>
                </header>
                <div className="p-6 flex-1">
                    <Outlet />
                </div>
                <AIChat />
            </main>
        </div>
    );
};