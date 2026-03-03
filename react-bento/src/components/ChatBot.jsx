import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// System Context-ai chat history-kulla sērkka pōṟōm (v1 support-kāga)
const systemContext = `You are Santhosh's Personal Assistant.
Profile: Santhosh S, B.Tech IT student at K S Rangasamy College of Technology [cite: 2026-02-26].
Skills: Java, SAP ABAP, MySQL, Python, Bootstrap, NLP, and AI/ML [cite: 2026-03-02].
Projects: Task Master and Smart Context AI [cite: 2026-02-26].
Rules: Answer ONLY based on this data. Otherwise, say you only discuss Santhosh's professional background.`;

export default function ChatBot({ onClose }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm Santhosh's AI assistant. Ask me about his skills or projects." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // 🔍 Available Models-ai Check paṇṇa diagnostic effect
    useEffect(() => {
        const listAvailableModels = async () => {
            try {
                console.log("--- Gemini Model Diagnostics ---");
                const modelList = await genAI.listModels(); // Method to fetch all models
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
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Using stable name 'gemini-1.5-flash'
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // 'systemInstruction' error-ai thavirkka, history-la context-ai sērkkiṟōm
            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: `Instructions: ${systemContext}` }] },
                    { role: 'model', parts: [{ text: "Understood. I will act as Santhosh's Professional Assistant." }] },
                    ...messages.slice(1).map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                ]
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            setMessages(prev => [...prev, { role: 'assistant', content: response.text() }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I hit an error. Check the console for model names!" }]);
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
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">AI Assistant</h3>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs text-gray-500 animate-pulse">Thinking...</div>}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Santhosh..."
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 text-sm focus:outline-none dark:text-white"
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="p-2 bg-orange-500 text-white rounded-full disabled:opacity-50">
                    <Send size={16} />
                </button>
            </form>
        </motion.div>
    );
}