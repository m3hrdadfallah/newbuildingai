
import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { TaskForm } from './TaskForm';
import { Task, TaskPhase, Priority, TaskStatus } from '../types';
import { formatJalaliDate, formatCurrency } from '../utils/helpers';
import { ChevronDown, ChevronUp, User, Tag, Calendar, AlertCircle, Search, Filter, Save, Edit2 } from 'lucide-react';

export const TasksPage: React.FC = () => {
    const { currentProject, deleteTask, saveProject } = useProject();
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
    const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
    const [filterResponsible, setFilterResponsible] = useState('');
    const [filterCritical, setFilterCritical] = useState(false);

    const toggleTask = (id: string) => {
        setExpandedTaskId(expandedTaskId === id ? null : id);
    };

    const handleEdit = (task: Task, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask(task);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Grouping
    const groupedTasks: Record<string, Task[]> = currentProject.tasks
        .filter(t => {
            const matchesSearch = t.title.includes(searchTerm) || t.wbs.includes(searchTerm);
            const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
            const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
            const matchesResponsible = !filterResponsible || t.responsible?.includes(filterResponsible);
            const matchesCritical = !filterCritical || t.isCritical;

            return matchesSearch && matchesStatus && matchesPriority && matchesResponsible && matchesCritical;
        })
        .reduce((acc, task) => {
            const phase = task.phase || 'سایر';
            if (!acc[phase]) acc[phase] = [];
            acc[phase].push(task);
            return acc;
        }, {} as Record<string, Task[]>);

    const sortedPhases: TaskPhase[] = [
        'تجهیز کارگاه', 'خاک‌برداری و سازه نگهبان', 'فونداسیون', 'اسکلت', 
        'سفت‌کاری', 'نازک‌کاری', 'تاسیسات مکانیکی', 'تاسیسات برقی', 'نما', 'محوطه‌سازی و تحویل'
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
            <div className="lg:col-span-1">
                <TaskForm 
                    taskToEdit={editingTask} 
                    onCancelEdit={() => setEditingTask(null)}
                />
            </div>
            <div className="lg:col-span-2 space-y-4">
                {/* Tools Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-500" />
                            فیلتر و جستجو
                        </h3>
                        <button 
                             onClick={saveProject}
                             className="text-xs bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-green-700 transition-colors"
                        >
                            <Save className="w-3 h-3" />
                            ذخیره تغییرات
                        </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="جستجو در فعالیت‌ها..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-3 pr-9 py-2 rounded-lg border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="مسئول..." 
                            value={filterResponsible}
                            onChange={e => setFilterResponsible(e.target.value)}
                            className="w-full sm:w-1/4 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                        />
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                        <select 
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as any)}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white outline-none min-w-[100px]"
                        >
                            <option value="ALL">همه وضعیت‌ها</option>
                            <option value="PENDING">برنامه‌ریزی</option>
                            <option value="IN_PROGRESS">در حال اجرا</option>
                            <option value="COMPLETED">تکمیل شده</option>
                        </select>
                        <select 
                            value={filterPriority}
                            onChange={e => setFilterPriority(e.target.value as any)}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white outline-none min-w-[100px]"
                        >
                            <option value="ALL">همه اولویت‌ها</option>
                            <option value="High">بالا</option>
                            <option value="Medium">متوسط</option>
                            <option value="Low">پایین</option>
                        </select>
                         <button 
                            onClick={() => setFilterCritical(!filterCritical)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap ${filterCritical ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-600'}`}
                        >
                            فقط مسیر بحرانی
                        </button>
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">ساختار شکست کار (WBS)</h3>
                        <span className="text-xs text-gray-500">{Object.values(groupedTasks).flat().length} فعالیت</span>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {sortedPhases.map(phase => {
                            const tasks = groupedTasks[phase];
                            if (!tasks || tasks.length === 0) return null;

                            return (
                                <div key={phase} className="bg-white">
                                    <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 border-b border-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        {phase}
                                    </div>
                                    <ul className="divide-y divide-gray-50">
                                        {tasks.map(task => {
                                             const isExpanded = expandedTaskId === task.id;
                                             return (
                                                <li key={task.id} className="hover:bg-gray-50 transition-colors group">
                                                    {/* Main Row */}
                                                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-3" onClick={() => toggleTask(task.id)}>
                                                        <div className="flex items-start gap-3 w-full sm:w-auto">
                                                            <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded mt-0.5 shrink-0">{task.wbs}</span>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <div className="font-medium text-gray-800 text-sm">{task.title}</div>
                                                                    {task.priority === 'High' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded shrink-0">فوری</span>}
                                                                    {task.isCritical && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded shrink-0">بحرانی</span>}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 items-center">
                                                                    <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3"/> {formatJalaliDate(task.startDate)}</span>
                                                                    <span className="text-gray-300">|</span>
                                                                    <span className="shrink-0">{task.duration} روز</span>
                                                                    <span className="text-gray-300">|</span>
                                                                    <span className={`px-1.5 rounded shrink-0 ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                                                        {task.status === 'COMPLETED' ? 'تکمیل' : task.status === 'IN_PROGRESS' ? 'اجرا' : 'برنامه'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                                            <div className="text-left flex-1 sm:flex-none">
                                                                <div className="flex justify-between sm:justify-end items-center gap-2 mb-1">
                                                                    <span className="text-xs text-gray-500 sm:hidden">پیشرفت:</span>
                                                                    <div className="text-xs font-semibold ltr text-right">{task.percentComplete}%</div>
                                                                </div>
                                                                <div className="w-full sm:w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-blue-500" style={{ width: `${task.percentComplete}%` }}></div>
                                                                </div>
                                                            </div>
                                                            <div className="pl-1">
                                                                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {isExpanded && (
                                                        <div className="px-4 sm:px-14 pb-4 text-sm text-gray-600 bg-gray-50/50 border-t border-gray-100">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                                                {task.description && (
                                                                    <div className="col-span-full">
                                                                        <span className="text-xs text-gray-400 block mb-1">شرح فعالیت:</span>
                                                                        <p className="text-gray-800 leading-relaxed text-sm">{task.description}</p>
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-xs text-gray-400">مسئول:</span>
                                                                        <span className="font-medium">{task.responsible || '-'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Tag className="w-4 h-4 text-gray-400" />
                                                                        <span className="text-xs text-gray-400">رشته:</span>
                                                                        <span className="font-medium">{task.discipline}</span>
                                                                    </div>
                                                                    {task.fixedCost && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-400">هزینه ثابت:</span>
                                                                            <span className="font-medium text-gray-800">{formatCurrency(task.fixedCost)} تومان</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {task.constraintDate && (
                                                                        <div className="flex items-center gap-2 text-orange-600">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            <span className="text-xs">محدودیت زمانی:</span>
                                                                            <span>{formatJalaliDate(task.constraintDate)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 gap-3">
                                                                <button 
                                                                    onClick={(e) => handleEdit(task, e)}
                                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs px-3 py-1.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                    ویرایش
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                                                    className="text-red-500 hover:text-red-700 text-xs px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                                                >
                                                                    حذف
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </li>
                                             );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                        {Object.keys(groupedTasks).length === 0 && (
                            <div className="p-8 text-center text-gray-400">هیچ فعالیتی با این فیلتر یافت نشد.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
