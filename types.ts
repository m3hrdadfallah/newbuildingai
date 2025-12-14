
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
export type ResourceType = 'Work' | 'Material' | 'Equipment' | 'Cost';
export type PredecessorType = 'FS' | 'SS' | 'FF' | 'SF';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskType = 'Task' | 'Milestone';
export type Priority = 'Low' | 'Medium' | 'High';
export type Discipline = 'Civil' | 'Architectural' | 'Electrical' | 'Mechanical' | 'General';

export type TaskPhase = 
    | 'تجهیز کارگاه' 
    | 'خاک‌برداری و سازه نگهبان' 
    | 'فونداسیون' 
    | 'اسکلت' 
    | 'سفت‌کاری' 
    | 'نازک‌کاری' 
    | 'تاسیسات مکانیکی' 
    | 'تاسیسات برقی' 
    | 'نما' 
    | 'محوطه‌سازی و تحویل';

export interface Predecessor {
    taskId: string;
    type: PredecessorType;
    lag: number; // days
}

export interface Resource {
    id: string;
    name: string;
    type: ResourceType;
    unit?: string;
    costRate: number; // Price per unit or hour
    currency: string;
    availabilityScore?: number; // 0-100 (AI inferred)
}

export interface TaskResourceAssignment {
    resourceId: string;
    quantity: number; // Planned quantity
    actualQuantity?: number; // Actual used
}

export interface Task {
    // Core Scheduling (Section A)
    id: string;
    wbs: string; // e.g., "1.2.1"
    title: string;
    description?: string; // شرح فعالیت
    taskType: TaskType; // نوع فعالیت
    phase: TaskPhase; // گروه فعالیت
    
    startDate: string; // Planned Start (ISO Date)
    finishDate: string; // Planned Finish (ISO Date)
    duration: number; // Planned Duration (days)
    constraintDate?: string; // تاریخ‌های محدودیت

    predecessors: Predecessor[];
    status: TaskStatus;
    
    // Responsibility & Classification
    responsible?: string; // مسئول فعالیت
    discipline?: Discipline; // رشته فعالیت
    priority: Priority; // اولویت
    isCritical?: boolean; // مسیر بحرانی

    // Actuals (Section B) - User Inputs
    actualStart?: string;
    actualFinish?: string;
    percentComplete: number; // 0-100 (User Input)
    actualCost?: number; // Cost incurred so far (User Input)
    delayReason?: string;
    
    // Resources & Cost (Section C)
    resources: TaskResourceAssignment[];
    fixedCost?: number; // هزینه ثابت بودجه‌ریزی شده
    
    // AI Data (Section D & E)
    riskLevel?: RiskLevel;
    predictedDelay?: number; // days
    aiSuggestions?: string[];
}

export interface ProjectDimensions {
    landArea: number; // مساحت زمین
    infrastructureArea: number; // زیربنا
    occupationArea: number; // سطح اشغال
    floors: number; // تعداد طبقات
    structureType: 'Concrete' | 'Metal' | 'Mixed'; // نوع سازه
    units: number; // تعداد واحد
}

export interface ProjectLocation {
    address: string;
    zoneType: 'Urban' | 'Industrial' | 'Residential' | 'Commercial';
    accessRestrictions?: string; // محدودیت دسترسی
}

export interface ProjectDesignSpecs {
    mechanicalSystem: string;
    electricalSystem: string;
    facadeType: string;
    roofType: string;
}

export interface ProjectContract {
    contractNumber: string;
    startDate: string;
    endDate: string; // تاریخ پایان
    durationMonths: number;
    penaltyPolicy?: string; // جریمه تاخیر
}

export interface ProjectFinancials {
    totalBudget: number;
    paymentMethod: string; // نحوه پرداخت
    workshopEquipCost: number; // هزینه تجهیز
}

export interface ProjectDetails {
    dimensions: ProjectDimensions;
    location: ProjectLocation;
    design: ProjectDesignSpecs;
    contract: ProjectContract;
    contractor: string; // پیمانکار اصلی
    financials: ProjectFinancials;
    constraints: string[]; // محدودیت‌ها و ریسک‌ها
    materialStrategy: string; // استراتژی تامین مصالح
}

export interface Project {
    id: string;
    name: string;
    description: string;
    
    // New Comprehensive Details
    details: ProjectDetails;

    tasks: Task[];
    resources: Resource[];
    
    // Global AI Analysis
    projectRiskScore?: number; // 0-100
    aiAlerts?: AIAlert[];
}

export interface AIAlert {
    id: string;
    type: 'Delay' | 'Cost' | 'Risk' | 'Opportunity';
    message: string;
    severity: 'info' | 'warning' | 'critical';
    date: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface User {
    id: string;
    username: string;
    role: 'Admin' | 'Manager' | 'Viewer';
    name: string;
    plan?: 'Free' | 'Pro';
    subscriptionExpiry?: string;
    quota?: {
        used: number;
        limit: number;
    };
}
