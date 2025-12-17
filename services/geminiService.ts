import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Project, Task, Resource, ProjectDetails } from '../types';

/**
 * ایجاد نمونه SDK هوش مصنوعی
 * از کلیدی که در vite.config.ts تعریف کردیم استفاده می‌کند
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

// استفاده از مدل فلش ۳ که سریع‌ترین و پایدارترین گزینه رایگان است
const MODEL_NAME = 'gemini-3-flash-preview';

export const createChatSession = (): Chat => {
    try {
        const ai = getAI();
        return ai.chats.create({
            model: MODEL_NAME,
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
        const ai = getAI();
        const prompt = `پروژه: ${projectDetails?.dimensions.structureType} - ${projectDetails?.dimensions.infrastructureArea} مترمربع.
        فعالیت: "${taskTitle}" با زمان ${duration} روز. 
        آیا این زمان‌بندی منطقی است؟ پاسخ در حداکثر ۲ جمله فارسی.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });
        return response.text || "پاسخی دریافت نشد.";
    } catch (error: any) {
        console.error("AI Quick Check Error:", error);
        return "سرویس هوش مصنوعی موقتاً در دسترس نیست یا کلید API محدود شده است.";
    }
};

export const analyzeProjectRisks = async (project: Project): Promise<any> => {
    try {
        const ai = getAI();
        const prompt = `تحلیل ریسک برای پروژه ${project.name}. تعداد فعالیت‌ها: ${project.tasks.length}. 
        خروجی را فقط به صورت JSON معتبر شامل امتیاز (projectScore) و لیست هشدارها (alerts) بده.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Risk Analysis Error:", error);
        return { projectScore: 70, alerts: [{type: 'Error', severity: 'warning', message: 'خطا در تحلیل هوشمند'}] };
    }
};

export const simulateScenario = async (project: Project, scenarioDescription: string): Promise<any> => {
    try {
        const ai = getAI();
        const prompt = `سناریو: ${scenarioDescription}. تاثیر بر هزینه و زمان پروژه را در قالب JSON با فیلدهای costDelta و timeDelta و impactDescription برگردان.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        return { impactDescription: "خطا در برقراری ارتباط با مدل Pro", costDelta: 0, timeDelta: 0, recommendedActions: [] };
    }
};

export const suggestProjectResources = async (project: Project): Promise<any[]> => {
    try {
        const ai = getAI();
        const prompt = `لیست منابع پیشنهادی برای سازه ${project.details.dimensions.structureType} را به صورت آرایه JSON شامل name, unit, estimatedRate بده.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        return [];
    }
};