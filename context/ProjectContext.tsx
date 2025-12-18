
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Task, Resource, AIAlert, ProjectDetails } from '../types';

interface ProjectContextType {
    currentProject: Project;
    addTask: (task: Task) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    addResource: (res: Resource) => void;
    updateResource: (res: Resource) => void;
    deleteResource: (resId: string) => void;
    updateProjectDetails: (details: ProjectDetails) => void;
    updateProjectAnalysis: (riskScore: number, alerts: AIAlert[]) => void;
    saveProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_RESOURCES: Resource[] = [
    { id: 'r1', name: 'سیمان تیپ 2', type: 'Material', unit: 'پاکت', costRate: 75000, currency: 'تومان', availabilityScore: 90 },
    { id: 'r2', name: 'کارگر ساده', type: 'Work', unit: 'ساعت', costRate: 180000, currency: 'تومان', availabilityScore: 80 },
    { id: 'r3', name: 'میلگرد 16', type: 'Material', unit: 'کیلوگرم', costRate: 32000, currency: 'تومان', availabilityScore: 95 },
    { id: 'r4', name: 'بیل مکانیکی', type: 'Equipment', unit: 'ساعت', costRate: 2500000, currency: 'تومان', availabilityScore: 60 },
    { id: 'r5', name: 'استادکار بنا', type: 'Work', unit: 'روز', costRate: 1500000, currency: 'تومان', availabilityScore: 70 },
    { id: 'r6', name: 'سرامیک درجه 1', type: 'Material', unit: 'متر', costRate: 450000, currency: 'تومان', availabilityScore: 85 },
];

// Helper to generate dates relative to "Now" to simulate a completed project history
const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

const INITIAL_TASKS: Task[] = [
    // Phase 1: Mobilization (Start: ~18 months ago)
    { 
        id: 't1', 
        wbs: '1.0',
        title: 'تجهیز کارگاه و نقشه‌برداری', 
        description: 'فنس‌کشی، ساخت اتاق نگهبانی، استقرار کانکس‌ها و میخ‌کوبی زمین.',
        taskType: 'Task',
        phase: 'تجهیز کارگاه',
        startDate: getPastDate(540), 
        finishDate: getPastDate(525),
        duration: 15, 
        status: 'COMPLETED', 
        percentComplete: 100,
        fixedCost: 250000000, // Budget
        actualCost: 280000000, // Cost Overrun
        predecessors: [],
        resources: [{ resourceId: 'r2', quantity: 50 }],
        riskLevel: 'Low',
        responsible: 'مهندس رضایی',
        discipline: 'General',
        priority: 'Medium',
        isCritical: true
    },
    // Phase 2: Excavation
    { 
        id: 't2', 
        wbs: '2.0',
        title: 'گودبرداری و سازه نگهبان', 
        description: 'خاکبرداری تا عمق -12 متر و اجرای نیلینگ و انکراژ.',
        taskType: 'Task',
        phase: 'خاک‌برداری و سازه نگهبان',
        startDate: getPastDate(524), 
        finishDate: getPastDate(464),
        duration: 60, 
        status: 'COMPLETED', 
        percentComplete: 100,
        fixedCost: 1200000000, 
        actualCost: 1450000000, // Significant overrun due to soil issues
        predecessors: [{ taskId: 't1', type: 'FS', lag: 0 }],
        resources: [{ resourceId: 'r4', quantity: 300 }],
        riskLevel: 'High',
        responsible: 'شرکت پایدار پی',
        discipline: 'Civil',
        priority: 'High',
        isCritical: true
    },
    // Phase 3: Foundation
    {
        id: 't3',
        wbs: '3.0',
        title: 'اجرای فونداسیون',
        description: 'بتن مگر، آرماتوربندی گسترده، قالب‌بندی و بتن‌ریزی فونداسیون.',
        taskType: 'Task',
        phase: 'فونداسیون',
        startDate: getPastDate(463), 
        finishDate: getPastDate(433),
        duration: 30,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 1800000000,
        actualCost: 1750000000, // Slightly under budget
        predecessors: [{ taskId: 't2', type: 'FS', lag: 0 }],
        resources: [{ resourceId: 'r3', quantity: 25000 }, { resourceId: 'r1', quantity: 1500 }],
        riskLevel: 'Medium',
        responsible: 'مهندس احمدی',
        discipline: 'Civil',
        priority: 'High',
        isCritical: true
    },
    // Phase 4: Structure (Concrete Skeleton) - Split into two parts
    {
        id: 't4',
        wbs: '4.1',
        title: 'اجرای اسکلت طبقات 1 تا 5',
        description: 'ستون‌ها، دیوارهای برشی و سقف‌های تیرچه بلوک طبقات پایین.',
        taskType: 'Task',
        phase: 'اسکلت',
        startDate: getPastDate(432), 
        finishDate: getPastDate(342),
        duration: 90,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 4500000000,
        actualCost: 4600000000,
        predecessors: [{ taskId: 't3', type: 'FS', lag: 0 }],
        resources: [{ resourceId: 'r3', quantity: 60000 }],
        riskLevel: 'Medium',
        responsible: 'مهندس احمدی',
        discipline: 'Civil',
        priority: 'High',
        isCritical: true
    },
    {
        id: 't5',
        wbs: '4.2',
        title: 'اجرای اسکلت طبقات 6 تا 10',
        description: 'ستون‌ها، دیوارهای برشی و سقف‌های طبقات بالا و خرپشته.',
        taskType: 'Task',
        phase: 'اسکلت',
        startDate: getPastDate(341), 
        finishDate: getPastDate(251),
        duration: 90,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 4500000000,
        actualCost: 4400000000, // Savings due to faster execution
        predecessors: [{ taskId: 't4', type: 'FS', lag: 0 }],
        resources: [{ resourceId: 'r3', quantity: 55000 }],
        riskLevel: 'Medium',
        responsible: 'مهندس احمدی',
        discipline: 'Civil',
        priority: 'High',
        isCritical: true
    },
    // Phase 5: Masonry (Stiff Work)
    {
        id: 't6',
        wbs: '5.0',
        title: 'سفت‌کاری و تیغه‌چینی',
        description: 'اجرای دیوارهای پیرامونی و داخلی با بلوک لیکا و وال‌پست.',
        taskType: 'Task',
        phase: 'سفت‌کاری',
        startDate: getPastDate(300), // Overlap with skeleton end
        finishDate: getPastDate(210),
        duration: 90,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 2200000000,
        actualCost: 2350000000,
        predecessors: [{ taskId: 't4', type: 'FS', lag: 10 }], // Start after floor 5 is done
        resources: [{ resourceId: 'r5', quantity: 400 }],
        riskLevel: 'Low',
        responsible: 'معمار کریمی',
        discipline: 'Architectural',
        priority: 'Medium',
        isCritical: false
    },
    // Phase 6: MEP
    {
        id: 't7',
        wbs: '6.0',
        title: 'تاسیسات مکانیکی و برقی (Rough-in)',
        description: 'لوله‌کشی آب، فاضلاب، گاز، کانال‌کشی و لوله‌گذاری برق.',
        taskType: 'Task',
        phase: 'تاسیسات مکانیکی',
        startDate: getPastDate(250), 
        finishDate: getPastDate(160),
        duration: 90,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 3500000000,
        actualCost: 3800000000, // Inflation impact
        predecessors: [{ taskId: 't6', type: 'SS', lag: 20 }],
        resources: [],
        riskLevel: 'Medium',
        responsible: 'مهندس تاسیسات',
        discipline: 'Mechanical',
        priority: 'Medium',
        isCritical: false
    },
    // Phase 7: Finishing
    {
        id: 't8',
        wbs: '7.1',
        title: 'نازک‌کاری (گچ و خاک، کاشی)',
        description: 'اجرای گچ و خاک، کاشی‌کاری سرویس‌ها و آشپزخانه.',
        taskType: 'Task',
        phase: 'نازک‌کاری',
        startDate: getPastDate(159), 
        finishDate: getPastDate(99),
        duration: 60,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 2800000000,
        actualCost: 2700000000,
        predecessors: [{ taskId: 't7', type: 'FS', lag: 0 }],
        resources: [{ resourceId: 'r6', quantity: 2000 }],
        riskLevel: 'Low',
        responsible: 'معمار کریمی',
        discipline: 'Architectural',
        priority: 'Medium',
        isCritical: true
    },
    {
        id: 't9',
        wbs: '7.2',
        title: 'نما‌سازی',
        description: 'اجرای نمای ترکیبی سنگ و آجر با اسکوپ کامل.',
        taskType: 'Task',
        phase: 'نما',
        startDate: getPastDate(120), 
        finishDate: getPastDate(60),
        duration: 60,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 4200000000,
        actualCost: 4200000000,
        predecessors: [{ taskId: 't6', type: 'FS', lag: 0 }],
        resources: [],
        riskLevel: 'High',
        responsible: 'پیمانکار نما',
        discipline: 'Architectural',
        priority: 'High',
        isCritical: false
    },
    // Phase 8: Final Finish
    {
        id: 't10',
        wbs: '7.3',
        title: 'نصبیات و نقاشی',
        description: 'کابینت، شیرآلات، کلید پریز، نقاشی نهایی و درب‌ها.',
        taskType: 'Task',
        phase: 'نازک‌کاری',
        startDate: getPastDate(59), 
        finishDate: getPastDate(14),
        duration: 45,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 3000000000,
        actualCost: 3100000000,
        predecessors: [{ taskId: 't8', type: 'FS', lag: 0 }],
        resources: [],
        riskLevel: 'Low',
        responsible: 'تیم معماری داخلی',
        discipline: 'General',
        priority: 'Medium',
        isCritical: true
    },
    // Phase 9: Handover
    {
        id: 't11',
        wbs: '8.0',
        title: 'محوطه‌سازی و تحویل موقت',
        description: 'اجرای فضای سبز، نظافت نهایی و صورت‌جلسه تحویل.',
        taskType: 'Milestone',
        phase: 'محوطه‌سازی و تحویل',
        startDate: getPastDate(13), 
        finishDate: getPastDate(0), // Ends today/yesterday
        duration: 14,
        status: 'COMPLETED',
        percentComplete: 100,
        fixedCost: 500000000,
        actualCost: 450000000,
        predecessors: [{ taskId: 't10', type: 'FS', lag: 0 }, { taskId: 't9', type: 'FS', lag: 0 }],
        resources: [],
        riskLevel: 'Low',
        responsible: 'مدیر پروژه',
        discipline: 'General',
        priority: 'High',
        isCritical: true
    }
];

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentProject, setCurrentProject] = useState<Project>({
        id: 'p1',
        name: 'برج مسکونی ۱۰ طبقه نگین',
        description: 'پروژه تکمیل شده شامل ۱۰ طبقه مسکونی و ۳ طبقه مشاعات با اسکلت بتنی و نمای مدرن.',
        details: {
            dimensions: {
                landArea: 600,
                infrastructureArea: 4200,
                occupationArea: 60,
                floors: 10,
                structureType: 'Concrete',
                units: 20
            },
            location: {
                address: 'تهران، سعادت آباد، خیابان مروارید',
                zoneType: 'Urban',
                accessRestrictions: 'تردد کامیون فقط شبانه'
            },
            design: {
                mechanicalSystem: 'داکت اسپلیت و پکیج',
                electricalSystem: 'سنتی با آیفون تصویری کدینگ',
                facadeType: 'سنگ تراورتن و آجر نسوز',
                roofType: 'بام سبز'
            },
            contract: {
                contractNumber: '1401/C-101',
                startDate: '1401/06/01',
                endDate: '1403/01/01',
                durationMonths: 18,
                penaltyPolicy: 'هر روز تاخیر 10 میلیون تومان'
            },
            contractor: 'شرکت سازه گستر البرز',
            financials: {
                totalBudget: 35000000000,
                paymentMethod: 'نقدی و تهاتر واحد',
                workshopEquipCost: 800000000
            },
            constraints: [
                'همجواری با مدرسه (محدودیت صدا)',
                'تراکم بالای منطقه'
            ],
            materialStrategy: 'خرید عمده میلگرد در ابتدای پروژه'
        },
        tasks: INITIAL_TASKS,
        resources: INITIAL_RESOURCES,
        projectRiskScore: 92, // High score because it's completed successfully
        aiAlerts: [
            { id: 'a1', type: 'Cost', severity: 'info', message: 'پروژه با موفقیت و با انحراف هزینه قابل قبول (۵٪+) به اتمام رسید.', date: new Date().toISOString() },
            { id: 'a2', type: 'Opportunity', severity: 'info', message: 'آماده‌سازی مدارک جهت اخذ پایان‌کار.', date: new Date().toISOString() }
        ]
    });

    const addTask = (task: Task) => {
        setCurrentProject(prev => ({
            ...prev,
            tasks: [...prev.tasks, task]
        }));
    };

    const updateTask = (updatedTask: Task) => {
        setCurrentProject(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        }));
    };

    const deleteTask = (taskId: string) => {
        setCurrentProject(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== taskId)
        }));
    };

    const addResource = (res: Resource) => {
        setCurrentProject(prev => ({
            ...prev,
            resources: [...prev.resources, res]
        }));
    };

    const updateResource = (updatedRes: Resource) => {
        setCurrentProject(prev => ({
            ...prev,
            resources: prev.resources.map(r => r.id === updatedRes.id ? updatedRes : r)
        }));
    };

    const deleteResource = (resId: string) => {
        setCurrentProject(prev => ({
            ...prev,
            resources: prev.resources.filter(r => r.id !== resId)
        }));
    };

    const updateProjectDetails = (details: ProjectDetails) => {
        setCurrentProject(prev => ({
            ...prev,
            details: details
        }));
    };

    const updateProjectAnalysis = (riskScore: number, alerts: AIAlert[]) => {
        setCurrentProject(prev => ({
            ...prev,
            projectRiskScore: riskScore,
            aiAlerts: alerts
        }));
    };

    const saveProject = () => {
        // In a real app, this would make an API call.
        // For now, we simulate persistence.
        console.log("Saving project data...", currentProject);
    };

    return (
        <ProjectContext.Provider value={{ currentProject, addTask, updateTask, deleteTask, addResource, updateResource, deleteResource, updateProjectDetails, updateProjectAnalysis, saveProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
