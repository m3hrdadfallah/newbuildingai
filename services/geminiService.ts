
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Project, Task, Resource, ProjectDetails } from '../types';

/**
 * ایجاد نمونه SDK هوش مصنوعی سازیار
 * مطابق با استانداردهای گوگل جمنای
 */

// مدل‌های پیشنهادی براساس نوع وظیفه
const FLASH_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';

export const createChatSession = (): Chat => {
    try {
        // Fix: Use direct initialization with process.env.API_KEY as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return ai.chats.create({
            model: FLASH_MODEL,
            config: {
                systemInstruction: `شما "سازیار" هستید، دستیار هوشمند مهندسی ساخت و ساز. 
                اطلاعات فنی پروژه شامل متراژ، نوع سازه و زمان‌بندی را در اختیار دارید. 
                وظیفه شما راهنمایی در مورد استانداردهای نظام مهندسی، تحلیل تاخیرات و برآورد مصالح است.
                پاسخ‌ها را فارسی، دقیق و حرفه‌ای ارائه دهید.`,
            }
        });
    } catch (e) {
        console.error("Failed to start AI session", e);
        throw e;
    }
};

export const quickCheckTask = async (taskTitle: string, duration: number, projectDetails?: ProjectDetails): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `پروژه: ${projectDetails?.dimensions.structureType} - ${projectDetails?.dimensions.infrastructureArea} مترمربع.
        فعالیت: "${taskTitle}" با زمان ${duration} روز. 
        آیا این زمان‌بندی منطقی است؟ پاسخ در حداکثر ۲ جمله فارسی.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: FLASH_MODEL,
            contents: prompt,
        });
        // Fix: Access .text property directly (not a method)
        return response.text || "پاسخی دریافت نشد.";
    } catch (error: any) {
        console.error("AI Quick Check Error:", error);
        return "سرویس هوش مصنوعی موقتاً در دسترس نیست یا کلید API محدود شده است.";
    }
};

export const analyzeProjectRisks = async (project: Project): Promise<any> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `تحلیل ریسک برای پروژه ${project.name}. تعداد فعالیت‌ها: ${project.tasks.length}. 
        خروجی را فقط به صورت JSON معتبر شامل امتیاز (projectScore) و لیست هشدارها (alerts) بده.`;

        const response = await ai.models.generateContent({
            model: PRO_MODEL, // Use Pro model for complex analysis
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        // Fix: Use .text property
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Risk Analysis Error:", error);
        return { projectScore: 70, alerts: [{type: 'Error', severity: 'warning', message: 'خطا در تحلیل هوشمند'}] };
    }
};

export const simulateScenario = async (project: Project, scenarioDescription: string): Promise<any> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `سناریو: ${scenarioDescription}. تاثیر بر هزینه و زمان پروژه را در قالب JSON با فیلدهای costDelta و timeDelta و impactDescription برگردان.`;

        const response = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        // Fix: Use .text property
        return JSON.parse(response.text || "{}");
    } catch (error) {
        return { impactDescription: "خطا در تحلیل سناریو", costDelta: 0, timeDelta: 0, recommendedActions: [] };
    }
};

export const suggestProjectResources = async (project: Project): Promise<any[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `لیست منابع پیشنهادی برای سازه ${project.details.dimensions.structureType} را به صورت آرایه JSON شامل name, type, unit, estimatedRate بده.`;

        const response = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        // Fix: Use .text property
        return JSON.parse(response.text || "[]");
    } catch (error) {
        return [];
    }
};
