import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const systemInstruction = `You are Santhosh's Personal Assistant.

Profile: Santhosh S, B.Tech IT student at K S Rangasamy College of Technology.

Skills: Java, SAP ABAP, MySQL, Python, Bootstrap, NLP, and AI/ML.

Key Projects: Task Master (Flutter productivity app) and Smart Context AI (Chrome Extension using Gemini Vision).

Certifications: Oracle Cloud Infrastructure, AI Foundation Associate, and Salesforce Agentforce Specialist.

Behavior Rules:
1. Answer ONLY based on the provided portfolio data.
2. If asked anything unrelated (jokes, weather, general knowledge, etc.), you MUST say: "I am programmed to only discuss Santhosh's professional background, skills, and projects. Please ask me about his technical expertise!"
3. Maintain a professional and helpful tone for recruiters (HR).`;

export default function ChatBot({ onClose }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm Santhosh's AI assistant. Ask me about his skills, projects, or experience." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

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
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        console.log("Connecting to Gemini...");

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: systemInstruction,
            }, { apiVersion: 'v1beta' }); // explicitly hitting the exact endpoint requirement if SDK complains

            // Convert format for Gemini
            const chatHistory = messages.slice(1).map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const chat = model.startChat({
                history: chatHistory
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'assistant', content: text }]);
        } catch (error) {
            console.error("Gemini API Error:", error);

            // Log specifically if it's a model not found / API version issue
            if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
                console.error("Model Name or API Version Error: Ensure you are using the precise model name 'gemini-1.5-flash' and @google/generative-ai version is fully updated.");
            }

            let errorMessage = "Sorry, I encountered an error connecting to the AI. Please try again later.";
            if (error.message && error.message.includes('API key not valid')) {
                errorMessage = "API Configuration Error. Please verify the Gemini API key in your .env file.";
            } else if (error.message && error.message.includes('not found')) {
                errorMessage = "Model Error: The AI model could not be found via the endpoint. Using the stable 'gemini-1.5-flash' should resolve this.";
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
            className="fixed bottom-36 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[110] overflow-hidden flex flex-col pointer-events-auto"
            style={{ maxHeight: 'calc(100vh - 160px)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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
                                ? 'bg-brand-orange text-white rounded-br-sm'
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
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about Santhosh..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-orange dark:text-white"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1.5 p-2 bg-brand-orange text-white rounded-full disabled:opacity-50 hover:bg-orange-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
