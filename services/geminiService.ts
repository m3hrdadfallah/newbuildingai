import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Project, Task, Resource, ProjectDetails } from '../types';

/**
 * مقداردهی اولیه هوش مصنوعی. 
 * کلید API مستقیماً از process.env.API_KEY که در vite.config تعریف شده خوانده می‌شود.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_NOT_FOUND");
  }
  return new GoogleGenAI({ apiKey });
};

// استفاده از مدل‌های پیشنهادی برای پایداری بیشتر
const MODEL_NAME = 'gemini-3-flash-preview';

export const createChatSession = (): Chat => {
    const ai = getAI();
    return ai.chats.create({
        model: MODEL_NAME,
        config: {
            systemInstruction: `شما "سازیار" هستید، یک دستیار هوشمند مدیریت پروژه ساختمانی.
            وظیفه شما تحلیل زمان‌بندی، هزینه و ریسک‌های اجرایی است.
            همیشه پاسخ‌ها را به زبان فارسی فنی و مهندسی ارائه دهید.`,
        }
    });
};

export const quickCheckTask = async (taskTitle: string, duration: number, projectDetails?: ProjectDetails): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `فعالیت: ${taskTitle}\nمدت زمان پیشنهادی: ${duration} روز\nآیا این زمان‌بندی منطقی است؟ لطفاً بر اساس استانداردهای مهندسی عمران پاسخ کوتاه بدهید.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });
        return response.text || "پاسخی از مدل دریافت نشد.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "خطا در برقراری ارتباط با هوش مصنوعی. لطفاً اینترنت خود را چک کنید.";
    }
};

export const analyzeProjectRisks = async (project: Project): Promise<any> => {
    try {
        const ai = getAI();
        const prompt = `تحلیل ریسک برای پروژه: ${project.name}\nتعداد فعالیت‌ها: ${project.tasks.length}\nخروجی را به صورت JSON شامل امتیاز سلامت (0-100) و لیست هشدارها بده.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        try {
            return JSON.parse(response.text || "{}");
        } catch (e) {
            return { projectScore: 80, alerts: [] };
        }
    } catch (error) {
        console.error("Risk Analysis Error:", error);
        return null;
    }
};

export const simulateScenario = async (project: Project, scenarioDescription: string): Promise<any> => {
    try {
        const ai = getAI();
        const prompt = `شبیه‌سازی سناریو: ${scenarioDescription}\nتاثیر بر پروژه ${project.name} چیست؟ خروجی JSON شامل costDelta و timeDelta باشد.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Simulation Error:", error);
        return { impactDescription: "خطا در شبیه‌سازی", costDelta: 0, timeDelta: 0, recommendedActions: [] };
    }
};

export const suggestProjectResources = async (project: Project): Promise<any[]> => {
    try {
        const ai = getAI();
        const prompt = `لیست منابع پیشنهادی برای پروژه ${project.details.dimensions.structureType} با زیربنای ${project.details.dimensions.infrastructureArea} متر مربع در قالب آرایه JSON.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Resource Suggestion Error:", error);
        return [];
    }
};