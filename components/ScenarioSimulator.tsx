import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { simulateScenario } from '../services/geminiService';
import { CloudRain, DollarSign, Truck, AlertTriangle, ArrowRight, Save, Play, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ScenarioSimulator: React.FC = () => {
    const { currentProject } = useProject();
    const [customScenario, setCustomScenario] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const predefinedScenarios = [
        { icon: <DollarSign className="w-4 h-4"/>, text: "افزایش 25 درصدی قیمت سیمان و میلگرد" },
        { icon: <CloudRain className="w-4 h-4"/>, text: "بارندگی شدید به مدت یک هفته در ماه آینده" },
        { icon: <Truck className="w-4 h-4"/>, text: "تاخیر 10 روزه در تحویل تاسیسات مکانیکی" }
    ];

    const handleRun = async (text: string) => {
        setIsSimulating(true);
        setResult(null);
        const res = await simulateScenario(currentProject, text);
        setResult(res);
        setIsSimulating(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            {/* Input Section */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    شبیه‌ساز سناریو (What-If)
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    سناریوهای مختلف (تغییر قیمت، آب‌وهوا، تاخیرات) را تست کنید تا هوش مصنوعی تاثیر آن را بر پروژه پیش‌بینی کند.
                </p>

                <div className="space-y-3 mb-6">
                    <label className="text-xs font-semibold text-gray-400 uppercase">سناریوهای آماده</label>
                    {predefinedScenarios.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setCustomScenario(s.text); handleRun(s.text); }}
                            className="w-full flex items-center gap-3 p-3 text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-gray-200 transition-all text-right"
                        >
                            {s.icon}
                            {s.text}
                        </button>
                    ))}
                </div>

                <div className="border-t border-gray-100 pt-6 mt-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">سناریوی دلخواه</label>
                    <textarea 
                        value={customScenario}
                        onChange={(e) => setCustomScenario(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                        placeholder="مثال: کمبود نیروی انسانی در بخش اسکلت‌بندی..."
                    />
                    <button 
                        onClick={() => handleRun(customScenario)}
                        disabled={isSimulating || !customScenario}
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isSimulating ? 'در حال شبیه‌سازی...' : (
                            <>
                                <Play className="w-4 h-4 fill-current" />
                                اجرای شبیه‌سازی
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Result Section */}
            <div className="lg:col-span-8 bg-slate-50 rounded-xl border border-slate-200 p-8 overflow-y-auto">
                {result ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">نتایج تحلیل هوشمند</h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className={`p-4 rounded-lg border ${result.costDelta > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                                    <span className="block text-xs opacity-70 mb-1">تخمین تغییر هزینه</span>
                                    <span className="text-xl font-bold" dir="ltr">
                                        {result.costDelta > 0 ? '+' : ''}{result.costDelta.toLocaleString()} <span className="text-sm">تومان</span>
                                    </span>
                                </div>
                                <div className={`p-4 rounded-lg border ${result.timeDelta > 0 ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                    <span className="block text-xs opacity-70 mb-1">تخمین تغییر زمان</span>
                                    <span className="text-xl font-bold" dir="ltr">
                                        {result.timeDelta > 0 ? '+' : ''}{result.timeDelta} <span className="text-sm">روز</span>
                                    </span>
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                <p>{result.impactDescription}</p>
                            </div>
                        </div>

                        {result.recommendedActions && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Save className="w-5 h-5 text-green-600" />
                                    اقدامات پیشنهادی (Mitigation Plan)
                                </h4>
                                <ul className="space-y-3">
                                    {result.recommendedActions.map((action: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                                            <ArrowRight className="w-5 h-5 text-blue-500 shrink-0" />
                                            {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium">منتظر اجرای سناریو...</p>
                        <p className="text-sm">یک سناریو انتخاب کنید یا بنویسید تا نتایج اینجا نمایش داده شود.</p>
                    </div>
                )}
            </div>
        </div>
    );
};