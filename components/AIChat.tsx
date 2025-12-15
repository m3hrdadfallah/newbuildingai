import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';

export const AIChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'سلام! من دستیار هوشمند پروژه شما هستم. چطور می‌توانم در زمان‌بندی یا تحلیل هزینه به شما کمک کنم؟', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            if (!chatSessionRef.current) {
                chatSessionRef.current = createChatSession();
            }
        } catch (e) {
            console.error("Failed to initialize chat session", e);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            if (!chatSessionRef.current) {
                 chatSessionRef.current = createChatSession();
            }
            
            const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
            const responseText = result.text;
            
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: Date.now()
            }]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            
            let errorMsg = 'متاسفانه خطایی در ارتباط با سرور رخ داد.';
            
            // Check for common errors
            if (error.message?.includes('API key') || error.toString().includes('API key')) {
                errorMsg = 'خطای تنظیمات: کلید API یافت نشد. لطفا تنظیمات محیطی (API_KEY) را بررسی کنید.';
            } else if (error.message?.includes('404') || error.message?.includes('not found')) {
                errorMsg = 'مدل هوش مصنوعی در دسترس نیست (404). لطفا بعدا تلاش کنید.';
            } else if (error.message?.includes('fetch failed')) {
                errorMsg = 'خطای شبکه. لطفا اتصال اینترنت خود را بررسی کنید.';
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: errorMsg,
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed z-50 transition-all duration-300 ${isOpen ? 'inset-0 sm:inset-auto sm:bottom-6 sm:left-6 sm:w-96 sm:h-[600px]' : 'bottom-6 left-6 w-auto h-auto'}`}>
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">چت هوشمند</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white sm:rounded-2xl shadow-2xl border-none sm:border border-gray-200 flex flex-col h-full w-full overflow-hidden">
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <h3 className="font-bold">دستیار مهندس</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-end">
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span className="text-xs text-gray-500">در حال فکر کردن...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="سوال خود را بپرسید..."
                                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};