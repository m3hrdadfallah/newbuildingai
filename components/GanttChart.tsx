
import React, { useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { Printer, Link as LinkIcon } from 'lucide-react';

export const GanttChart: React.FC = () => {
    const { currentProject } = useProject();

    // Auto-Calculate Critical Path (Simplified Logic for Demo)
    const tasksWithCalculatedCriticality = useMemo(() => {
        if (!currentProject.tasks.length) return [];
        
        const endDates = currentProject.tasks.map(t => new Date(t.finishDate).getTime());
        const maxEnd = Math.max(...endDates);
        
        return currentProject.tasks.map(t => {
            const taskEnd = new Date(t.finishDate).getTime();
            const daysDiff = (maxEnd - taskEnd) / (1000 * 60 * 60 * 24);
            const isAutoCritical = daysDiff < 1; 
            return { ...t, isAutoCritical: t.isCritical || isAutoCritical };
        });
    }, [currentProject.tasks]);

    const { minDate, maxDate, totalDays } = useMemo(() => {
        if (tasksWithCalculatedCriticality.length === 0) {
            return { minDate: new Date(), maxDate: new Date(), totalDays: 0 };
        }
        
        const dates = tasksWithCalculatedCriticality.map(t => new Date(t.startDate).getTime());
        const endDates = tasksWithCalculatedCriticality.map(t => new Date(t.finishDate).getTime());

        const min = new Date(Math.min(...dates));
        const max = new Date(Math.max(...endDates));
        
        // Add padding days for better visuals
        min.setDate(min.getDate() - 2);
        max.setDate(max.getDate() + 5); 

        const diffTime = Math.abs(max.getTime() - min.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { minDate: min, maxDate: max, totalDays: days };
    }, [tasksWithCalculatedCriticality]);

    // Helper to get X percentage based on date
    const getDateX = (dateStr: string) => {
        const d = new Date(dateStr);
        const diff = Math.ceil((d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
        return (diff / totalDays) * 100;
    };

    const ROW_HEIGHT = 56; // Fixed height for rows
    const HEADER_HEIGHT = 40; 

    // Helper to find WBS of predecessors
    const getPredecessorLabels = (predecessors: any[]) => {
        if (!predecessors || predecessors.length === 0) return '';
        return predecessors.map(p => {
            const parent = tasksWithCalculatedCriticality.find(t => t.id === p.taskId);
            return parent ? parent.wbs : '?';
        }).join(', ');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-140px)] print:h-auto print:border-none print:shadow-none">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center print:hidden">
                <h3 className="font-bold text-gray-700">نمای گرافیکی زمان‌بندی (Gantt)</h3>
                <div className="flex gap-4 items-center">
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> نرمال</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> بحرانی</div>
                    </div>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-800 text-xs">
                        <Printer className="w-3 h-3" />
                        چاپ / PDF
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto print:overflow-visible relative">
                <div className="min-w-[1200px] p-6 print:min-w-0 print:p-0 relative">
                    
                    {/* Header */}
                    <div className="flex border-b border-gray-200 pb-2 mb-4 sticky top-0 bg-white z-20 print:static" style={{ height: HEADER_HEIGHT }}>
                        <div className="w-16 font-bold text-gray-600 text-center text-sm border-r border-gray-100">WBS</div>
                        <div className="w-64 font-bold text-gray-600 border-r border-gray-100 px-4 text-sm">نام فعالیت</div>
                        <div className="w-24 font-bold text-gray-600 border-r border-gray-100 px-2 text-center text-sm">پیش‌نیاز</div>
                        
                        <div className="flex-1 relative h-6 border-r border-gray-100 text-xs text-gray-400">
                             <span className="absolute right-0 -top-1">{minDate.toLocaleDateString('fa-IR')}</span>
                             <span className="absolute left-0 -top-1">{maxDate.toLocaleDateString('fa-IR')}</span>
                             
                             {/* Grid Lines */}
                             {Array.from({ length: 10 }).map((_, i) => (
                                 <div key={i} className="absolute h-full border-r border-dashed border-gray-100" style={{ right: `${(i+1) * 10}%` }} />
                             ))}
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-0 print:space-y-4 relative z-20">
                        {tasksWithCalculatedCriticality.map((task, index) => {
                            const startP = getDateX(task.startDate);
                            const endP = getDateX(task.finishDate);
                            const widthP = endP - startP;
                            const isCrit = task.isAutoCritical;
                            const predLabel = getPredecessorLabels(task.predecessors);

                            return (
                                <div 
                                    key={task.id} 
                                    className="flex items-center hover:bg-gray-50 border-b border-gray-100 group print:py-0"
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    <div className="w-16 text-center text-sm font-mono text-gray-500 flex-shrink-0 border-r border-gray-100 h-full flex items-center justify-center">{task.wbs}</div>
                                    <div className="w-64 px-4 border-r border-gray-100 flex-shrink-0 h-full flex items-center">
                                        <div className="font-medium text-sm text-gray-800 truncate" title={task.title}>{task.title}</div>
                                    </div>
                                    <div className="w-24 px-2 border-r border-gray-100 flex-shrink-0 h-full flex items-center justify-center">
                                        {predLabel ? (
                                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                <LinkIcon className="w-3 h-3" />
                                                {predLabel}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 text-xs">-</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 relative h-full border-r border-gray-100 mx-2">
                                        {/* Bar */}
                                        <div 
                                            className={`absolute h-8 top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 overflow-hidden shadow-sm transition-all
                                                ${isCrit ? 'bg-red-100 border border-red-300' : 'bg-blue-100 border border-blue-300'}
                                                group-hover:shadow-md
                                            `}
                                            style={{ 
                                                right: `${startP}%`, 
                                                width: `${Math.max(widthP, 0.5)}%` 
                                            }}
                                        >
                                            <div 
                                                className={`absolute top-0 right-0 h-full opacity-30 ${isCrit ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${task.percentComplete}%` }}
                                            />
                                            <span className={`relative z-10 text-[10px] whitespace-nowrap font-medium ${isCrit ? 'text-red-800' : 'text-blue-800'}`}>
                                                {task.percentComplete}%
                                            </span>
                                        </div>

                                        {/* Optional Visual Pred Indicator on chart */}
                                        {predLabel && (
                                            <div 
                                                className="absolute top-1/2 -translate-y-1/2 text-[10px] text-gray-400 flex items-center gap-0.5"
                                                style={{ right: `calc(${startP}% + 8px)` }} 
                                            >
                                               <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white/80 px-1 rounded">
                                                   وابسته به {predLabel}
                                               </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
