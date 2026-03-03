import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useRealtimeData } from '../hooks/useRealtimeData';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function ChatBot({ onClose }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm Santhosh's AI assistant. Ask me about his skills, projects, or experience." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const [projects] = useRealtimeData('projects');
    const [skills] = useRealtimeData('skills');
    const [profile] = useRealtimeData('profile');

    // 🔍 Available Models Diagnostic (Logs to Browser Console)
    useEffect(() => {
        const listAvailableModels = async () => {
            try {
                console.log("--- Gemini Model Diagnostics ---");
                const modelList = await genAI.listModels();
                console.log("✅ Models found for your key:", modelList);
            } catch (err) {
                console.error("❌ Could not list models:", err);
            }
        };
        listAvailableModels();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add the user message to UI immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // No systemInstruction here, explicitly use proper stable model
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash"
            }, { apiVersion: 'v1beta' });

            // Construct Dynamic Context
            let dynamicContext = "";
            const isDataLoading = !profile || !skills || !projects;

            if (isDataLoading) {
                dynamicContext = "You are Santhosh's Professional AI Assistant. Please provide a helpful, professional greeting. (Detailed portfolio data is currently loading from the database).";
            } else {
                const profileStr = profile.length > 0 ? Object.values(profile[0]).join(', ') : 'Not specified';
                const skillsStr = skills.map(s => s.name || s.title || s.skill || Object.values(s)[0]).join(', ');
                const projectsStr = projects.map(p => `${p.title || p.name} (${p.shortDescription || p.description || ''})`).join(', ');

                dynamicContext = `You are Santhosh's Professional AI Assistant.
YOUR CORE DIRECTIVE:
1. You MUST ONLY answer questions related to Santhosh's professional background, skills, and projects listed below.
2. If the user asks ANY question not directly related to Santhosh's profile (like writing code, general knowledge, math, weather, jokes, etc.), you MUST STRICTLY REFUSE and reply EXACTLY with: "I am programmed to only discuss Santhosh's professional background, skills, and projects."
3. Do not invent information or break character.

PORTFOLIO DATA:
Profile: ${profileStr}
Skills: ${skillsStr}
Key Projects: ${projectsStr}`;
            }

            // Create valid history array with Portfolio context at index 0 and 1
            const strictHistory = [
                {
                    role: 'user',
                    parts: [{ text: `Instructions: ${dynamicContext}` }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood. I will act strictly as Santhosh's Professional Assistant and will refuse to answer any questions unrelated to the provided portfolio data." }]
                },
                ...messages.slice(1).map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            ];

            const chat = model.startChat({
                history: strictHistory
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error("Chat Error:", error);

            let errorMessage = "Sorry, I hit an error connecting to the AI. Check the console.";
            if (error.message && error.message.includes('API key not valid')) {
                errorMessage = "API Configuration Error. Please verify the Gemini API key in your .env file.";
            } else if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
                errorMessage = "Model Error: The 'gemini-2.5-flash' model could not be found via the endpoint. Check your API permissions.";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-36 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[110] flex flex-col pointer-events-auto overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">AI Assistant</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-orange-500 text-white rounded-br-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm p-3 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Santhosh..."
                    className="w-full flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-2.5 px-4 text-sm focus:outline-none focus:border-brand-orange dark:text-white"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-brand-orange text-white rounded-full disabled:opacity-50 hover:bg-orange-600 transition-colors"
                    style={{ backgroundColor: '#f97316' }}
                >
                    <Send size={16} />
                </button>
            </form>
        </motion.div>
    );
}
