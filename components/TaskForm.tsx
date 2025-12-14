
import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskType, Priority, Discipline, TaskPhase } from '../types';
import { quickCheckTask } from '../services/geminiService';
import { formatCurrency, addDays, getCurrentJalaliDate, jalaliToGregorian, gregorianToJalaliObj, formatJalaliDate } from '../utils/helpers';
import { JalaliDatePicker } from './JalaliDatePicker';
import { Zap, Plus, User, Save, Edit2, X, Calendar, AlertCircle, BarChart3, Coins } from 'lucide-react';

interface TaskFormProps {
    taskToEdit?: Task | null;
    onCancelEdit?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ taskToEdit, onCancelEdit }) => {
    const { addTask, updateTask, currentProject, saveProject } = useProject();
    
    // Core
    const [title, setTitle] = useState('');
    const [wbs, setWbs] = useState('');
    const [description, setDescription] = useState('');
    const [taskType, setTaskType] = useState<TaskType>('Task');
    const [phase, setPhase] = useState<TaskPhase>('تجهیز کارگاه');
    
    // Schedule
    const [jalaliStartDate, setJalaliStartDate] = useState(getCurrentJalaliDate());
    const [isoStartDate, setIsoStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState(1);
    
    // Constraint (Jalali)
    const [jalaliConstraintDate, setJalaliConstraintDate] = useState('');
    const [isoConstraintDate, setIsoConstraintDate] = useState('');

    // Responsibility & Attributes
    const [responsible, setResponsible] = useState('');
    const [discipline, setDiscipline] = useState<Discipline>('General');
    const [priority, setPriority] = useState<Priority>('Medium');
    const [isCritical, setIsCritical] = useState(false);
    
    // Cost & Progress (Actuals)
    const [fixedCost, setFixedCost] = useState<number | ''>(''); // Maps to BAC (Budget At Completion)
    const [percentComplete, setPercentComplete] = useState<number>(0);
    const [actualCost, setActualCost] = useState<number | ''>(''); // Maps to AC (Actual Cost)

    // AI
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Populate form when editing
    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setWbs(taskToEdit.wbs);
            setDescription(taskToEdit.description || '');
            setTaskType(taskToEdit.taskType);
            setPhase(taskToEdit.phase);
            setDuration(taskToEdit.duration);
            setResponsible(taskToEdit.responsible || '');
            setDiscipline(taskToEdit.discipline || 'General');
            setPriority(taskToEdit.priority);
            setIsCritical(taskToEdit.isCritical || false);
            setFixedCost(taskToEdit.fixedCost || '');
            setPercentComplete(taskToEdit.percentComplete);
            setActualCost(taskToEdit.actualCost || '');
            
            // Handle Date Conversions for Edit
            const jStart = gregorianToJalaliObj(taskToEdit.startDate);
            const jStartStr = `${jStart.jy}/${jStart.jm.toString().padStart(2,'0')}/${jStart.jd.toString().padStart(2,'0')}`;
            setJalaliStartDate(jStartStr);
            setIsoStartDate(taskToEdit.startDate);

            if (taskToEdit.constraintDate) {
                const jConst = gregorianToJalaliObj(taskToEdit.constraintDate);
                const jConstStr = `${jConst.jy}/${jConst.jm.toString().padStart(2,'0')}/${jConst.jd.toString().padStart(2,'0')}`;
                setJalaliConstraintDate(jConstStr);
                setIsoConstraintDate(taskToEdit.constraintDate);
            } else {
                setJalaliConstraintDate('');
                setIsoConstraintDate('');
            }
            
            setIsExpanded(true); // Open form details in edit mode
        }
    }, [taskToEdit]);

    const calculatedFinishDate = addDays(isoStartDate, duration);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (duration < 1) {
            setError('مدت زمان فعالیت باید حداقل ۱ روز باشد.');
            return;
        }

        if (!isoStartDate || isoStartDate === 'Invalid Date') {
            setError('تاریخ شروع نامعتبر است.');
            return;
        }

        let computedStatus = taskToEdit ? taskToEdit.status : 'PENDING';
        if (percentComplete === 100) computedStatus = 'COMPLETED';
        else if (percentComplete > 0) computedStatus = 'IN_PROGRESS';
        else computedStatus = 'PENDING';
        
        const taskData: Task = {
            id: taskToEdit ? taskToEdit.id : Date.now().toString(),
            wbs: wbs || `1.${Math.floor(Math.random() * 100)}`,
            title,
            description,
            taskType,
            phase,
            startDate: isoStartDate,
            finishDate: calculatedFinishDate,
            duration: duration || 1, // ensure duration is at least 1 or defined
            constraintDate: isoConstraintDate || undefined,
            status: computedStatus,
            percentComplete: percentComplete,
            actualCost: actualCost === '' ? 0 : Number(actualCost),
            predecessors: taskToEdit ? taskToEdit.predecessors : [],
            resources: taskToEdit ? taskToEdit.resources : [],
            responsible,
            discipline,
            priority,
            isCritical,
            fixedCost: fixedCost === '' ? undefined : Number(fixedCost),
            riskLevel: taskToEdit ? taskToEdit.riskLevel : 'Low'
        };
        
        if (taskToEdit) {
            updateTask(taskData);
            if(onCancelEdit) onCancelEdit();
        } else {
            addTask(taskData);
        }
        
        saveProject();
        
        // Reset if not editing
        if (!taskToEdit) {
            setTitle('');
            setWbs('');
            setDescription('');
            setResponsible('');
            setFixedCost('');
            setPercentComplete(0);
            setActualCost('');
            setAiFeedback(null);
            setError(null);
        }
    };

    const handleAICheck = async () => {
        if (!title) return;
        setIsValidating(true);
        const feedback = await quickCheckTask(title, duration, currentProject.details);
        setAiFeedback(feedback);
        setIsValidating(false);
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-6 sticky top-6 transition-colors ${taskToEdit ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {taskToEdit ? <Edit2 className="w-5 h-5 text-orange-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                    {taskToEdit ? 'ویرایش فعالیت' : 'تعریف فعالیت جدید (MSP)'}
                </div>
                {taskToEdit && (
                     <button onClick={onCancelEdit} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                     </button>
                )}
                {!taskToEdit && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                        {isExpanded ? 'ساده' : 'مشخصات تکمیلی'}
                    </button>
                )}
            </h3>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="flex gap-4">
                    <div className="w-1/4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">کد WBS</label>
                        <input 
                            type="text" 
                            value={wbs}
                            onChange={e => setWbs(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-left font-mono"
                            placeholder="1.1"
                            dir="ltr"
                        />
                    </div>
                    <div className="w-3/4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">عنوان فعالیت</label>
                        <input 
                            type="text" 
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                            placeholder="مثال: بتن ریزی سقف 1"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">گروه فعالیت (فاز)</label>
                    <select 
                        value={phase}
                        onChange={e => setPhase(e.target.value as TaskPhase)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="تجهیز کارگاه">تجهیز کارگاه</option>
                        <option value="خاک‌برداری و سازه نگهبان">خاک‌برداری و سازه نگهبان</option>
                        <option value="فونداسیون">فونداسیون</option>
                        <option value="اسکلت">اسکلت</option>
                        <option value="سفت‌کاری">سفت‌کاری</option>
                        <option value="نازک‌کاری">نازک‌کاری</option>
                        <option value="تاسیسات مکانیکی">تاسیسات مکانیکی</option>
                        <option value="تاسیسات برقی">تاسیسات برقی</option>
                        <option value="نما">نما</option>
                        <option value="محوطه‌سازی و تحویل">محوطه‌سازی و تحویل</option>
                    </select>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <JalaliDatePicker 
                            label="تاریخ شروع (شمسی)"
                            value={jalaliStartDate}
                            onChange={(j, i) => { setJalaliStartDate(j); setIsoStartDate(i); }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">مدت (روز)</label>
                        <input 
                            type="number" 
                            min="1"
                            required
                            value={duration}
                            onChange={e => {
                                const val = parseInt(e.target.value);
                                setDuration(isNaN(val) ? 0 : val);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                        />
                         <div className="mt-2 text-xs text-slate-500 flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> پایان:</span>
                            <span className="font-medium text-slate-700 dir-rtl">{formatJalaliDate(calculatedFinishDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Financials & Progress (BAC, AC, %) */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                     <div className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        مدیریت هزینه و پیشرفت (EVM)
                     </div>
                     
                     <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">بودجه مصوب (BAC)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={fixedCost}
                                onChange={e => setFixedCost(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 outline-none bg-white font-mono"
                                placeholder="بودجه کل فعالیت..."
                            />
                            <span className="absolute left-2 top-2.5 text-xs text-gray-400">تومان</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                             بودجه نهایی (BAC) را وارد کنید. در صورت خالی بودن، مجموع هزینه منابع محاسبه می‌شود.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">درصد پیشرفت</label>
                            <input 
                                type="number" 
                                min="0" 
                                max="100"
                                value={percentComplete}
                                onChange={e => setPercentComplete(Math.min(100, Math.max(0, Number(e.target.value))))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-center font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">هزینه واقعی (AC)</label>
                            <input 
                                type="number" 
                                value={actualCost}
                                onChange={e => setActualCost(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                placeholder="هزینه کرد..."
                            />
                        </div>
                     </div>
                     {/* Progress Bar Visual */}
                     <div className="mt-2 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${percentComplete}%` }}></div>
                     </div>
                </div>

                {isExpanded && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-2 border-t">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">شرح فعالیت</label>
                            <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-sm h-20 resize-none"
                                placeholder="توضیحات تکمیلی..."
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">نوع فعالیت</label>
                                <select 
                                    value={taskType}
                                    onChange={e => setTaskType(e.target.value as TaskType)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="Task">Task (عادی)</option>
                                    <option value="Milestone">Milestone (مایل‌ستون)</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">رشته فعالیت</label>
                                <select 
                                    value={discipline}
                                    onChange={e => setDiscipline(e.target.value as Discipline)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="Civil">عمران/سازه</option>
                                    <option value="Architectural">معماری</option>
                                    <option value="Mechanical">مکانیک</option>
                                    <option value="Electrical">برق</option>
                                    <option value="General">عمومی</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">مسئول فعالیت</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={responsible}
                                        onChange={e => setResponsible(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                        placeholder="نام مسئول"
                                    />
                                    <User className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">اولویت</label>
                                <select 
                                    value={priority}
                                    onChange={e => setPriority(e.target.value as Priority)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="Low">پایین</option>
                                    <option value="Medium">متوسط</option>
                                    <option value="High">بالا</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <JalaliDatePicker 
                                    label="محدودیت تاریخ (شمسی)"
                                    value={jalaliConstraintDate}
                                    onChange={(j, i) => { setJalaliConstraintDate(j); setIsoConstraintDate(i); }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="isCritical"
                                checked={isCritical}
                                onChange={e => setIsCritical(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isCritical" className="text-sm text-gray-700">این فعالیت به صورت دستی در مسیر بحرانی قرار گیرد</label>
                        </div>
                    </div>
                )}

                {/* AI Helper Section */}
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            اعتبارسنجی هوشمند
                        </span>
                        <button 
                            type="button"
                            onClick={handleAICheck}
                            disabled={isValidating || !title}
                            className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {isValidating ? '...' : 'بررسی'}
                        </button>
                    </div>
                    {aiFeedback && (
                        <p className="text-xs text-indigo-900 leading-relaxed bg-white p-2 rounded border border-indigo-50 whitespace-pre-line">
                            {aiFeedback}
                        </p>
                    )}
                </div>

                <button 
                    type="submit" 
                    className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 ${taskToEdit ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                >
                    <Save className="w-4 h-4" />
                    {taskToEdit ? 'ذخیره تغییرات' : 'ثبت فعالیت جدید'}
                </button>
            </form>
        </div>
    );
};
