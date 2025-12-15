import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Project, Task, Resource, ProjectDetails } from '../types';

// In a Vite environment, we rely on the define in vite.config.ts to replace this string.
// If accessing process directly causes a crash in the browser, we wrap it.
let apiKey: string | undefined = undefined;
try {
    // @ts-ignore
    apiKey = process.env.API_KEY;
} catch (e) {
    console.warn("process.env.API_KEY access failed");
}

// Only initialize if key exists
let ai: GoogleGenAI | null = null;
if (apiKey) {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Failed to initialize Gemini:", e);
    }
}

const COMPLEX_MODEL = 'gemini-2.5-flash';
const FAST_MODEL = 'gemini-2.0-flash-lite';

export const createChatSession = (): Chat | null => {
    if (!ai) return null;
    return ai.chats.create({
        model: COMPLEX_MODEL,
        config: {
            systemInstruction: `شما "مدیر هوشمند پروژه" هستید.
            تخصص: مدیریت پیمان، شرایط عمومی پیمان، تحلیل تاخیرات، تعدیل و صورت وضعیت.
            دسترسی به داده‌های پروژه شامل WBS، منابع، ابعاد پروژه، نوع قرارداد و پیشرفت واقعی دارید.
            در تحلیل‌ها، نوع سازه، منطقه جغرافیایی و ریسک‌های مالی را همزمان در نظر بگیرید.`,
        }
    });
};

export const quickCheckTask = async (taskTitle: string, duration: number, projectDetails?: ProjectDetails): Promise<string> => {
    if (!ai) return "سرویس هوش مصنوعی غیرفعال است.";
    
    try {
        let contextPrompt = "";
        if (projectDetails) {
            contextPrompt = `
            مشخصات پروژه:
            - نوع سازه: ${projectDetails.dimensions.structureType}
            - تعداد طبقات: ${projectDetails.dimensions.floors}
            - متراژ زیربنا: ${projectDetails.dimensions.infrastructureArea} مترمربع
            - محل پروژه: ${projectDetails.location.zoneType} (${projectDetails.location.address})
            - سیستم اجرا: ${projectDetails.design.facadeType} / ${projectDetails.design.roofType}
            `;
        }

        const prompt = `
        نقش: مدیر ارشد کنترل پروژه.
        ${contextPrompt}
        
        سوال: آیا فعالیت "${taskTitle}" با مدت زمان "${duration} روز" برای پروژه‌ای با مشخصات بالا منطقی است؟
        
        پاسخ را کوتاه و فارسی بده شامل:
        1. تایید یا رد منطقی بودن زمان (با توجه به متراژ و حجم کار).
        2. یک ریسک فنی یا اجرایی خاص این فعالیت در این نوع پروژه.
        3. پیشنهاد اصلاحی (اگر نیاز است).
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: FAST_MODEL,
            contents: prompt,
        });
        return response.text || "خطا در دریافت پاسخ.";
    } catch (error) {
        console.error(error);
        return "سرویس در دسترس نیست.";
    }
};

export const simulateScenario = async (
    project: Project,
    scenarioDescription: string
): Promise<{ 
    impactDescription: string, 
    costDelta: number, 
    timeDelta: number, 
    recommendedActions: string[] 
}> => {
    if (!ai) return {
        impactDescription: "سرویس هوش مصنوعی تنظیم نشده است.",
        costDelta: 0,
        timeDelta: 0,
        recommendedActions: []
    };

    const projectSummary = {
        name: project.name,
        details: project.details, 
        totalTasks: project.tasks.length,
        currentRiskScore: project.projectRiskScore,
        criticalTasks: project.tasks.filter(t => t.isCritical || t.riskLevel === 'High').map(t => ({ title: t.title, responsible: t.responsible })),
        resources: project.resources.map(r => ({ name: r.name, cost: r.costRate, type: r.type }))
    };

    const prompt = `
    تحلیل سناریوی پیشرفته پروژه ساختمانی (Simulation):
    
    سناریو: "${scenarioDescription}"
    
    مشخصات کامل پروژه: ${JSON.stringify(projectSummary)}
    
    وظیفه:
    1. تاثیر این سناریو بر هزینه کل (تخمین عدد). با توجه به متراژ و نوع قرارداد.
    2. تاثیر بر زمان اتمام پروژه (تخمین روز).
    3. اقدامات اصلاحی (Mitigation Plan).
    
    خروجی را حتماً به فرمت JSON معتبر زیر برگردان:
    {
        "impactDescription": "توضیح متنی کامل و تحلیلی",
        "costDelta": number (افزایش/کاهش به تومان),
        "timeDelta": number (افزایش/کاهش به روز),
        "recommendedActions": ["action1", "action2"]
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: COMPLEX_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const text = response.text;
        return JSON.parse(text || "{}");
    } catch (error) {
        console.error("Simulation Error", error);
        return {
            impactDescription: "خطا در پردازش سناریو",
            costDelta: 0,
            timeDelta: 0,
            recommendedActions: ["بررسی دستی سناریو"]
        };
    }
};

export const analyzeProjectRisks = async (project: Project): Promise<any> => {
    if (!ai) return null;

    const tasksData = project.tasks.map(t => ({
        id: t.id,
        name: t.title,
        status: t.status,
        duration: t.duration,
        progress: t.percentComplete,
        priority: t.priority,
        isCritical: t.isCritical
    }));

    const context = {
        details: project.details,
        tasks: tasksData
    };

    const prompt = `
    به عنوان یک متخصص کنترل پروژه، داده‌های زیر را تحلیل کن و خروجی JSON بده:
    1. projectScore (0 تا 100، 100 یعنی عالی).
    2. alerts: لیستی از هشدارها (type: Delay/Cost/Risk, severity: info/warning/critical, message).
    3. criticalPathSuggestion: متنی کوتاه درباره مسیر بحرانی.

    Project Context: ${JSON.stringify(context)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: COMPLEX_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const suggestProjectResources = async (project: Project): Promise<any[]> => {
    if (!ai) return [];

    const context = {
        details: project.details,
        tasks: project.tasks.map(t => t.title)
    };

    const prompt = `
    به عنوان مهندس متره و برآورد، بر اساس مشخصات پروژه زیر، لیست منابع اصلی (مصالح، ماشین‌آلات، نیروی انسانی) مورد نیاز را پیشنهاد بده.
    
    مشخصات پروژه:
    - نوع: ${project.details.dimensions.structureType}
    - متراژ: ${project.details.dimensions.infrastructureArea} مترمربع
    - طبقات: ${project.details.dimensions.floors}
    - لیست فعالیت‌ها: ${JSON.stringify(context.tasks)}

    خروجی باید یک آرایه JSON باشد که هر آیتم شامل موارد زیر است:
    {
        "name": "نام منبع (مثلا سیمان تیپ 2)",
        "type": "Material" | "Work" | "Equipment",
        "unit": "واحد (تن، مترمکعب، ساعت...)",
        "estimatedRate": number (قیمت واحد تخمینی به تومان - تقریبی بازار ایران),
        "reason": "دلیل پیشنهاد (مثلا برای فونداسیون)"
    }
    
    حداقل 5 و حداکثر 10 مورد مهم پیشنهاد بده.
    `;

    try {
        const response = await ai.models.generateContent({
            model: COMPLEX_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error(error);
        return [];
    }
};