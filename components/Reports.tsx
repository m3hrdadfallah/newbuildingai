
import React, { useMemo, useState, useRef } from 'react';
import { useProject } from '../context/ProjectContext';
import { formatCurrency, downloadCSV } from '../utils/helpers';
import { Download, Printer, FileText, HelpCircle, TrendingUp, Activity, Eye, EyeOff } from 'lucide-react';

export const Reports: React.FC = () => {
    const { currentProject } = useProject();
    
    // Chart Interaction State
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [visibleCurves, setVisibleCurves] = useState({
        pv: true,
        ev: true,
        ac: true
    });
    
    const chartRef = useRef<SVGSVGElement>(null);

    // 1. Precise EVM Calculations & S-Curve Data Generation
    const { taskAnalysis, aggregates, sCurveData } = useMemo(() => {
        let totalBudget = 0;
        let totalEV = 0;
        let totalAC = 0;

        // --- Task Level Analysis ---
        const tasks = currentProject.tasks.map(t => {
            // Calculate Budget (BAC)
            const resourceCost = t.resources.reduce((sum, res) => {
                const r = currentProject.resources.find(x => x.id === res.resourceId);
                return sum + ((r?.costRate || 0) * res.quantity);
            }, 0);
            
            // Priority: Manual Fixed Cost > Calculated Resource Cost
            const bac = t.fixedCost !== undefined ? t.fixedCost : resourceCost;

            // EV: Earned Value
            const ev = bac * (t.percentComplete / 100);

            // AC: Actual Cost
            const ac = t.actualCost || 0;

            // Forecasts
            const cpi = ac > 0 ? ev / ac : 1;
            const validCPI = (cpi > 0.1 && cpi < 3) ? cpi : 1;
            const etc = (bac - ev) / validCPI;
            const eac = ac + etc;
            const vac = bac - eac;

            totalBudget += bac;
            totalEV += ev;
            totalAC += ac;

            return { ...t, bac, ev, ac, cpi, eac, vac };
        });

        // --- S-Curve Time Series Generation ---
        if (tasks.length === 0) {
            return { 
                taskAnalysis: [], 
                aggregates: { totalBudget:0, totalEV:0, totalAC:0, cv:0, cpi:0, vac:0, eac:0 }, 
                sCurveData: [] 
            };
        }

        const dates = tasks.map(t => new Date(t.startDate).getTime());
        const endDates = tasks.map(t => new Date(t.finishDate).getTime());
        
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...endDates);
        const now = Date.now();
        
        // Duration covering the whole project + 10% buffer
        const totalDuration = maxDate - minDate;
        const chartEnd = Math.max(maxDate, now) + (totalDuration * 0.05);
        
        const pointsCount = 50; // Resolution of the chart
        const step = (chartEnd - minDate) / pointsCount;
        
        const curve = [];

        for (let i = 0; i <= pointsCount; i++) {
            const timePoint = minDate + (i * step);
            
            let cumPV = 0;
            let cumEV = 0;
            let cumAC = 0;
            
            // Only calculate Actuals (EV/AC) if timePoint is in the past/present
            const isPast = timePoint <= (now + (step / 2)); // Small buffer

            tasks.forEach(task => {
                const tStart = new Date(task.startDate).getTime();
                const tEnd = new Date(task.finishDate).getTime();
                const tDur = tEnd - tStart;

                // 1. Planned Value (PV) Accumulation
                if (timePoint >= tEnd) {
                    cumPV += task.bac;
                } else if (timePoint > tStart && tDur > 0) {
                    const ratio = (timePoint - tStart) / tDur;
                    cumPV += task.bac * ratio;
                }

                // 2. EV & AC Accumulation (Heuristic: Linear distribution over actual duration so far)
                if (isPast && task.status !== 'PENDING') {
                    // Determine "Actual End" for distribution purposes
                    // If completed, use finish date. If in progress, use Now.
                    let actualEnd = now;
                    if (task.status === 'COMPLETED') {
                        actualEnd = Math.min(now, tEnd); // Simplified assumption
                    }
                    
                    if (timePoint >= tStart) {
                        const actualDur = actualEnd - tStart;
                        let ratio = 1;
                        
                        if (actualDur > 0) {
                            ratio = (Math.min(timePoint, actualEnd) - tStart) / actualDur;
                        }
                        
                        // Clamp ratio
                        if (timePoint < tStart) ratio = 0;
                        if (ratio > 1) ratio = 1;

                        // Add to cumulative totals
                        // Note: task.ev is the TOTAL EV earned by the task so far. We distribute it.
                        if (timePoint <= actualEnd || task.status === 'COMPLETED') {
                             cumEV += task.ev * ratio;
                             cumAC += task.ac * ratio;
                        } else {
                             // If timePoint > actualEnd (and task not complete), we hold the value
                             cumEV += task.ev;
                             cumAC += task.ac;
                        }
                    }
                }
            });

            curve.push({
                idx: i,
                timePoint,
                label: new Date(timePoint).toLocaleDateString('fa-IR'),
                pv: Math.round(cumPV),
                ev: isPast ? Math.round(cumEV) : null,
                ac: isPast ? Math.round(cumAC) : null
            });
        }

        const totalCPI = totalAC > 0 ? totalEV / totalAC : 1;
        const totalEAC = totalAC + ((totalBudget - totalEV) / (totalCPI > 0 ? totalCPI : 1));

        return {
            taskAnalysis: tasks,
            aggregates: { 
                totalBudget, 
                totalEV, 
                totalAC, 
                cv: totalEV - totalAC,
                cpi: totalCPI,
                vac: totalBudget - totalEAC,
                eac: totalEAC
            },
            sCurveData: curve
        };
    }, [currentProject]);

    // --- SVG Chart Configuration ---
    const chartHeight = 350;
    const chartWidth = 900;
    const padding = 60;
    
    // Dynamic Scaling
    const maxY = Math.max(
        aggregates.totalBudget * 1.1, 
        aggregates.eac * 1.1,
        ...sCurveData.map(d => d.ac || 0)
    ) || 1000;

    const getX = (idx: number) => padding + (idx * (chartWidth - 2 * padding) / (sCurveData.length - 1));
    const getY = (val: number) => chartHeight - padding - ((val / maxY) * (chartHeight - 2 * padding));

    // Path Generators
    const createPath = (key: 'pv' | 'ac' | 'ev') => {
        let d = "";
        let started = false;
        sCurveData.forEach((pt, i) => {
            const val = pt[key];
            if (val !== null && val !== undefined) {
                const x = getX(i);
                const y = getY(val);
                if (!started) {
                    d += `M ${x} ${y} `;
                    started = true;
                } else {
                    d += `L ${x} ${y} `;
                }
            }
        });
        return d;
    };

    // Interaction Handlers
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!chartRef.current) return;
        const rect = chartRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - padding;
        const contentWidth = chartWidth - 2 * padding;
        
        // Find closest index
        let idx = Math.round((x / contentWidth) * (sCurveData.length - 1));
        idx = Math.max(0, Math.min(idx, sCurveData.length - 1));
        setHoverIndex(idx);
    };

    const handleMouseLeave = () => {
        setHoverIndex(null);
    };

    const handlePrint = () => window.print();

    const handleExportExcel = () => {
        const data = taskAnalysis.map(t => ({
            'WBS': t.wbs,
            'Activity': t.title,
            'BAC': t.bac,
            'EV': t.ev,
            'AC': t.ac,
            'CPI': t.cpi.toFixed(2),
            'EAC': t.eac,
            'VAC': t.vac
        }));
        downloadCSV(data, 'EVM_Report');
    };

    return (
        <div className="space-y-8 pb-20 print:pb-0 print:space-y-4">
            
            {/* Header */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-blue-600" />
                        گزارش عملکرد و نمودار S
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">تحلیل وضعیت پروژه بر اساس استاندارد EVM (مدیریت ارزش کسب شده)</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm shadow">
                        <Printer className="w-4 h-4" />
                        چاپ
                    </button>
                    <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm shadow">
                        <Download className="w-4 h-4" />
                        اکسل
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute right-0 top-0 w-1 h-full bg-blue-500"></div>
                    <span className="text-gray-500 text-xs block mb-1">بودجه کل مصوب (BAC)</span>
                    <h3 className="text-xl font-bold text-gray-800">{formatCurrency(aggregates.totalBudget)}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-green-200 transition-colors">
                    <div className="absolute right-0 top-0 w-1 h-full bg-green-500"></div>
                    <span className="text-gray-500 text-xs block mb-1">ارزش کسب شده (EV)</span>
                    <h3 className="text-xl font-bold text-green-600">{formatCurrency(aggregates.totalEV)}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-red-200 transition-colors">
                    <div className="absolute right-0 top-0 w-1 h-full bg-red-500"></div>
                    <span className="text-gray-500 text-xs block mb-1">هزینه واقعی (AC)</span>
                    <h3 className={`text-xl font-bold ${aggregates.totalAC > aggregates.totalEV ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatCurrency(aggregates.totalAC)}
                    </h3>
                </div>
                 <div className={`p-5 rounded-xl border shadow-sm relative overflow-hidden ${aggregates.cv >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <span className={`text-xs block mb-1 font-bold ${aggregates.cv >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        انحراف هزینه (CV)
                    </span>
                    <h3 className={`text-xl font-bold ${aggregates.cv >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                        {aggregates.cv > 0 ? '+' : ''}{formatCurrency(aggregates.cv)}
                    </h3>
                </div>
            </div>

            {/* S-Curve Chart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:break-inside-avoid relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-600" />
                        نمودار پیشرفت پروژه (S-Curve)
                    </h3>
                </div>

                {/* SVG Container */}
                <div className="w-full overflow-x-auto mb-6 relative">
                    <svg 
                        ref={chartRef}
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                        className="w-full h-auto min-w-[700px] select-none cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Background & Grid */}
                        <rect x={padding} y={padding} width={chartWidth - 2*padding} height={chartHeight - 2*padding} fill="#fcfcfc" />
                        
                        {/* Y Axis Grid & Labels */}
                        {Array.from({length: 6}).map((_, i) => {
                            const val = maxY - (i * (maxY / 5));
                            const y = padding + (i * (chartHeight - 2 * padding) / 5);
                            return (
                                <g key={`y-${i}`}>
                                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                                    <text x={padding - 10} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
                                        {(val / 1000000).toFixed(0)}M
                                    </text>
                                </g>
                            );
                        })}

                        {/* X Axis Grid & Labels */}
                        {sCurveData.filter((_, i) => i % 5 === 0).map((pt, i) => {
                             const x = getX(pt.idx);
                             return (
                                <g key={`x-${i}`}>
                                    <line x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                                    <text x={x} y={chartHeight - 15} fontSize="10" fill="#64748b" textAnchor="middle" fontFamily="Vazirmatn">
                                        {pt.label}
                                    </text>
                                </g>
                             );
                        })}

                        {/* Curves */}
                        {visibleCurves.pv && (
                            <path d={createPath('pv')} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                        {visibleCurves.ev && (
                            <path d={createPath('ev')} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                        {visibleCurves.ac && (
                            <path d={createPath('ac')} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,5" />
                        )}

                        {/* Hover Indicator Line */}
                        {hoverIndex !== null && (
                            <line 
                                x1={getX(hoverIndex)} 
                                y1={padding} 
                                x2={getX(hoverIndex)} 
                                y2={chartHeight - padding} 
                                stroke="#94a3b8" 
                                strokeWidth="1.5" 
                                strokeDasharray="4"
                            />
                        )}
                        
                        {/* Interactive Points (Dots on hover) */}
                        {hoverIndex !== null && sCurveData[hoverIndex] && (
                            <>
                                {visibleCurves.pv && <circle cx={getX(hoverIndex)} cy={getY(sCurveData[hoverIndex].pv)} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />}
                                {visibleCurves.ev && sCurveData[hoverIndex].ev !== null && <circle cx={getX(hoverIndex)} cy={getY(sCurveData[hoverIndex].ev!)} r="4" fill="white" stroke="#22c55e" strokeWidth="2" />}
                                {visibleCurves.ac && sCurveData[hoverIndex].ac !== null && <circle cx={getX(hoverIndex)} cy={getY(sCurveData[hoverIndex].ac!)} r="4" fill="white" stroke="#ef4444" strokeWidth="2" />}
                            </>
                        )}
                    </svg>

                    {/* Custom Tooltip Overlay */}
                    {hoverIndex !== null && sCurveData[hoverIndex] && (
                        <div 
                            className="absolute bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-lg p-3 text-xs z-10 pointer-events-none"
                            style={{ 
                                top: padding + 10, 
                                left: Math.min(getX(hoverIndex) + 20, chartWidth - 200) // Keep tooltip inside bounds
                            }}
                        >
                            <div className="font-bold text-gray-800 border-b border-gray-100 pb-1 mb-2 text-center">
                                {sCurveData[hoverIndex].label}
                            </div>
                            <div className="space-y-1.5 min-w-[140px]">
                                {visibleCurves.pv && (
                                    <div className="flex justify-between items-center text-blue-700">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Planned (PV):</span>
                                        <span className="font-mono font-bold">{formatCurrency(sCurveData[hoverIndex].pv)}</span>
                                    </div>
                                )}
                                {visibleCurves.ev && sCurveData[hoverIndex].ev !== null && (
                                    <div className="flex justify-between items-center text-green-700">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Earned (EV):</span>
                                        <span className="font-mono font-bold">{formatCurrency(sCurveData[hoverIndex].ev!)}</span>
                                    </div>
                                )}
                                {visibleCurves.ac && sCurveData[hoverIndex].ac !== null && (
                                    <div className="flex justify-between items-center text-red-700">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Actual (AC):</span>
                                        <span className="font-mono font-bold">{formatCurrency(sCurveData[hoverIndex].ac!)}</span>
                                    </div>
                                )}
                                {(sCurveData[hoverIndex].ev === null) && (
                                    <div className="text-gray-400 text-[10px] text-center italic mt-1">داده‌های واقعی برای آینده موجود نیست</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Toggleable Legends */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 select-none">
                    
                    {/* PV Toggle */}
                    <div 
                        onClick={() => setVisibleCurves(prev => ({ ...prev, pv: !prev.pv }))}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${visibleCurves.pv ? 'bg-white shadow-sm border border-blue-100' : 'opacity-50 grayscale'}`}
                    >
                        <div className="w-10 h-1 bg-blue-500 rounded-full mt-2.5 shrink-0"></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-800">برنامه‌ای (PV)</span>
                                {visibleCurves.pv ? <Eye className="w-4 h-4 text-blue-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                            </div>
                            <span className="text-xs text-gray-500 leading-relaxed block mt-1">
                                بودجه برنامه‌ریزی شده در طول زمان.
                            </span>
                        </div>
                    </div>

                    {/* EV Toggle */}
                    <div 
                        onClick={() => setVisibleCurves(prev => ({ ...prev, ev: !prev.ev }))}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${visibleCurves.ev ? 'bg-white shadow-sm border border-green-100' : 'opacity-50 grayscale'}`}
                    >
                        <div className="w-10 h-1 bg-green-500 rounded-full mt-2.5 shrink-0"></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-800">پیشرفت واقعی (EV)</span>
                                {visibleCurves.ev ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                            </div>
                            <span className="text-xs text-gray-500 leading-relaxed block mt-1">
                                ارزش کارهای تکمیل شده تا امروز.
                            </span>
                        </div>
                    </div>

                    {/* AC Toggle */}
                    <div 
                        onClick={() => setVisibleCurves(prev => ({ ...prev, ac: !prev.ac }))}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${visibleCurves.ac ? 'bg-white shadow-sm border border-red-100' : 'opacity-50 grayscale'}`}
                    >
                        <div className="w-10 h-1 border-t-2 border-dashed border-red-500 mt-2.5 shrink-0"></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-800">هزینه واقعی (AC)</span>
                                {visibleCurves.ac ? <Eye className="w-4 h-4 text-red-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                            </div>
                            <span className="text-xs text-gray-500 leading-relaxed block mt-1">
                                هزینه‌های صرف شده (صورت وضعیت).
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-700">جدول تحلیل مغایرت‌ها (Variance Analysis)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-white text-slate-700 border-b border-gray-200 font-bold">
                                <th className="p-4 border-l bg-gray-50">WBS</th>
                                <th className="p-4 border-l min-w-[180px] bg-gray-50">فعالیت</th>
                                <th className="p-4 border-l text-center bg-gray-50">%</th>
                                <th className="p-4 border-l bg-blue-50 text-blue-900">بودجه (BAC)</th>
                                <th className="p-4 border-l bg-green-50 text-green-900">ارزش (EV)</th>
                                <th className="p-4 border-l bg-red-50 text-red-900">هزینه (AC)</th>
                                <th className="p-4 border-l text-center bg-gray-50">CPI</th>
                                <th className="p-4 border-l bg-gray-50">پیش‌بینی (EAC)</th>
                                <th className="p-4 bg-gray-50">انحراف (VAC)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {taskAnalysis.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 border-l text-center font-mono text-gray-500">{task.wbs}</td>
                                    <td className="p-3 border-l font-medium text-gray-800">{task.title}</td>
                                    <td className="p-3 border-l text-center">
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 font-bold text-[10px]">
                                            {task.percentComplete}%
                                        </span>
                                    </td>
                                    <td className="p-3 border-l font-mono text-gray-600 bg-blue-50/10">{formatCurrency(task.bac)}</td>
                                    <td className="p-3 border-l font-mono text-gray-600 bg-green-50/10">{formatCurrency(task.ev)}</td>
                                    <td className="p-3 border-l font-mono text-gray-600 bg-red-50/10">{formatCurrency(task.ac)}</td>
                                    <td className="p-3 border-l text-center">
                                        {task.ac > 0 ? (
                                            <span className={`font-bold ${task.cpi < 1 ? 'text-red-600' : 'text-green-600'}`}>
                                                {task.cpi.toFixed(2)}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-3 border-l font-mono text-gray-500">{formatCurrency(task.eac)}</td>
                                    <td className={`p-3 font-mono font-bold ${task.vac < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(task.vac)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-800 text-white font-bold">
                            <tr>
                                <td colSpan={3} className="p-3 text-center border-l border-slate-700">کل پروژه</td>
                                <td className="p-3 border-l border-slate-700 font-mono text-blue-200">{formatCurrency(aggregates.totalBudget)}</td>
                                <td className="p-3 border-l border-slate-700 font-mono text-green-200">{formatCurrency(aggregates.totalEV)}</td>
                                <td className="p-3 border-l border-slate-700 font-mono text-red-200">{formatCurrency(aggregates.totalAC)}</td>
                                <td className="p-3 border-l border-slate-700 text-center">{aggregates.cpi.toFixed(2)}</td>
                                <td className="p-3 border-l border-slate-700 font-mono">{formatCurrency(aggregates.eac)}</td>
                                <td className={`p-3 font-mono ${aggregates.vac < 0 ? 'text-red-300' : 'text-green-300'}`}>
                                    {formatCurrency(aggregates.vac)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};
