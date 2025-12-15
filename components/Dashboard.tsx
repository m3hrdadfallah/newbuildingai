import React, { useEffect, useState, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { analyzeProjectRisks } from '../services/geminiService';
import { Activity, AlertTriangle, TrendingUp, DollarSign, Calendar, Sparkles, Upload, Download, Save } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { currentProject, updateProjectAnalysis, saveProject, importProject, exportProjectJSON } = useProject();
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshAnalysis = async () => {
        setLoadingAnalysis(true);
        const result = await analyzeProjectRisks(currentProject);
        if (result) {
            // Map AI result to our internal types
            const alerts = result.alerts.map((a: any, idx: number) => ({
                id: `ai-${Date.now()}-${idx}`,
                type: a.type,
                severity: a.severity,
                message: a.message,
                date: new Date().toISOString()
            }));
            updateProjectAnalysis(result.projectScore, alerts);
        }
        setLoadingAnalysis(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                importProject(json);
            } catch (err) {
                console.error("Error parsing JSON", err);
                alert("فرمت فایل نامعتبر است.");
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Calculate Total Budget (BAC)
    const totalBudget = currentProject.tasks.reduce((acc, task) => {
        const resourceCost = task.resources.reduce((tRes, res) => {
            const resourceInfo = currentProject.resources.find(r => r.id === res.resourceId);
            return tRes + (resourceInfo ? resourceInfo.costRate * res.quantity : 0);
        }, 0);
        
        // If user entered a manual budget (fixedCost), use it. Else use resource sum.
        const taskBac = task.fixedCost !== undefined ? task.fixedCost : resourceCost;
        return acc + taskBac;
    }, 0);

    // Calculate Physical Progress Weighted (simplified for dashboard)
    const totalProgress = currentProject.tasks.length > 0 
        ? Math.round(currentProject.tasks.reduce((acc, t) => acc + t.percentComplete, 0) / currentProject.tasks.length) 
        : 0;

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">داشبورد مدیریت پروژه</h2>
                    <p className="text-sm text-gray-500">نمای کلی وضعیت و سلامت پروژه</p>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".json" 
                        onChange={handleFileUpload} 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                        title="بارگذاری فایل پروژه (JSON)"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">ورود اطلاعات</span>
                    </button>
                    <button 
                        onClick={exportProjectJSON}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                        title="دانلود فایل پشتیبان پروژه"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">خروجی</span>
                    </button>
                    <button 
                        onClick={saveProject}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        ذخیره در ابری
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">امتیاز سلامت پروژه</p>
                        <h3 className={`text-2xl font-bold ${
                            (currentProject.projectRiskScore || 0) > 70 ? 'text-green-600' : 
                            (currentProject.projectRiskScore || 0) > 40 ? 'text-orange-500' : 'text-red-600'
                        }`}>
                            {currentProject.projectRiskScore || '--'} / 100
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Activity className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">بودجه کل (BAC)</p>
                        <h3 className="text-2xl font-bold text-gray-800">
                            {(totalBudget / 1000000).toFixed(1)} <span className="text-sm font-normal text-gray-500">میلیون تومان</span>
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">تعداد هشدارها</p>
                        <h3 className="text-2xl font-bold text-red-600">
                            {currentProject.aiAlerts?.length || 0}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">پیشرفت فیزیکی</p>
                        <h3 className="text-2xl font-bold text-purple-600">
                            {totalProgress}%
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Alerts Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            هوش مصنوعی جمنای (Gemini Analysis)
                        </h3>
                        <button 
                            onClick={refreshAnalysis} 
                            disabled={loadingAnalysis}
                            className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                            {loadingAnalysis ? <span className="animate-spin">⌛</span> : <Sparkles className="w-3 h-3" />}
                            {loadingAnalysis ? 'در حال تحلیل...' : 'تحلیل مجدد'}
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {currentProject.aiAlerts && currentProject.aiAlerts.length > 0 ? (
                            currentProject.aiAlerts.map(alert => (
                                <div key={alert.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                        alert.severity === 'critical' ? 'bg-red-500' : 
                                        alert.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded ${
                                                alert.type === 'Risk' ? 'bg-red-100 text-red-700' :
                                                alert.type === 'Cost' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {alert.type}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(alert.date).toLocaleTimeString('fa-IR')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">{alert.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                <Sparkles className="w-10 h-10 text-gray-200 mb-2" />
                                <p>هنوز هشداری ثبت نشده است.</p>
                                <p className="text-xs mt-1">برای دریافت تحلیل هوشمند، روی دکمه "تحلیل مجدد" کلیک کنید.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Info */}
                <div className="bg-slate-800 text-white rounded-xl shadow-lg p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-4">{currentProject.name}</h3>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed flex-1">
                        {currentProject.description}
                    </p>
                    <div className="space-y-4 mt-auto">
                        <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
                            <span className="text-slate-400">تعداد فعالیت‌ها</span>
                            <span className="font-mono">{currentProject.tasks.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
                            <span className="text-slate-400">تعداد منابع فعال</span>
                            <span className="font-mono">{currentProject.resources.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
                            <span className="text-slate-400">تاریخ شروع</span>
                            <span className="font-mono">1403/01/15</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};