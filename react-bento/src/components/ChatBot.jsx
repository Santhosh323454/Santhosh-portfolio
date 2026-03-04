import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { forceDownload } from '../utils/downloadUtils';
import ReactMarkdown from 'react-markdown';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Priority list of preferred Gemini models (best/newest first)
const PREFERRED_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
];

export default function ChatBot({ onClose }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm Santhosh's AI assistant. Ask me about his skills, projects, or experience." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resolvedModel, setResolvedModel] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);
    const messagesEndRef = useRef(null);

    const [projects] = useRealtimeData('projects');
    const [skills] = useRealtimeData('skills');
    const [profile] = useRealtimeData('profile');



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-detect the best available Gemini model on mount
    useEffect(() => {
        async function detectModel() {
            try {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
                );
                const data = await res.json();
                const available = (data.models || [])
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                    .map(m => m.name?.replace('models/', ''))
                    // Only keep proper Gemini conversational models — exclude gemma, tts, image-gen, robotics, etc.
                    .filter(name => {
                        if (!name) return false;
                        if (name.startsWith('gemma')) return false;       // Gemma models don't follow complex prompts
                        if (name.includes('-tts')) return false;           // Text-to-speech models
                        if (name.includes('image')) return false;          // Image generation models
                        if (name.includes('robotics')) return false;       // Robotics models
                        if (name.includes('nano-banana')) return false;    // Experimental nano
                        if (name.includes('deep-research')) return false;  // Research models
                        if (name.includes('computer-use')) return false;   // Computer use models
                        return name.startsWith('gemini');                  // Only real Gemini models
                    });

                console.log('[ChatBot] Available conversational models:', available);
                setAvailableModels(available);

                // Pick based on priority list
                let picked = null;
                for (const preferred of PREFERRED_MODELS) {
                    if (available.some(a => a.includes(preferred))) {
                        picked = preferred;
                        break;
                    }
                }

                // Fallback to first available if none match priority list
                if (!picked && available.length > 0) {
                    picked = available[0];
                }

                const finalModel = picked || 'gemini-2.0-flash';
                console.log('[ChatBot] Using model:', finalModel);
                setResolvedModel(finalModel);

                // Model selected silently — no UI message shown
            } catch (err) {
                console.warn('[ChatBot] Could not list models, falling back to gemini-2.0-flash:', err);
                setResolvedModel('gemini-2.0-flash');
                // Remove the detecting message silently on error
                setMessages(prev => prev.filter(m => m.role !== 'system'));
            }
        }
        detectModel();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Build the models to try: preferred order first, then ALL detected models as extra fallbacks
        const startModel = resolvedModel || PREFERRED_MODELS[0];
        const startIdx = PREFERRED_MODELS.indexOf(startModel);
        const preferredOrdered = startIdx >= 0
            ? [...PREFERRED_MODELS.slice(startIdx), ...PREFERRED_MODELS.slice(0, startIdx)]
            : [startModel, ...PREFERRED_MODELS];

        // Append all available models not already in preferred list
        const allModels = [...preferredOrdered, ...availableModels];

        // Deduplicate while preserving order
        const seen = new Set();
        const tryList = allModels.filter(m => m && !seen.has(m) && seen.add(m));
        console.log('[ChatBot] Will try models in order:', tryList);

        // Construct context from LIVE Firestore data only — no hardcoded details
        const p = profile ? (Array.isArray(profile) ? profile[0] : profile) : {};
        const profileStr = [
            p.name && `Name: ${p.name}`,
            p.title && `Title: ${p.title}`,
            p.description && `Bio: ${p.description}`,
            p.college && `Education: ${p.college}`,
            p.degree && `Degree: ${p.degree}`,
            p.email && `Email: ${p.email}`,
            p.phone && `Phone: ${p.phone}`,
            p.location && `Location: ${p.location}`,
        ].filter(Boolean).join('\n') || 'Profile data loading...';

        const skillsStr = skills && skills.length > 0
            ? skills.map(s => s.name || s.title || s.skill || Object.values(s)[0]).filter(Boolean).join(', ')
            : 'Skills data loading...';

        const projectsStr = projects && projects.length > 0
            ? projects.slice(0, 2).map(p => `• ${p.title || p.name}${p.shortDescription || p.description ? ': ' + (p.shortDescription || p.description) : ''}`).join('\n')
            : 'Projects data loading...';

        const certsStr = p.certifications
            ? (Array.isArray(p.certifications) ? p.certifications.join(', ') : p.certifications)
            : 'Oracle Cloud Infrastructure, AI Foundation Associate, Salesforce Agentforce Specialist';

        const dynamicContext = `You are ${p.name || 'Santhosh'}'s friendly, helpful Personal Bot. Your job is to enthusiastically represent ${p.name || 'Santhosh'}, chat with visitors, and answer their questions about his professional background. Use a warm, conversational, and natural tone (use emojis sparingly but appropriately!).

YOUR CORE DIRECTIVE:
1. You MUST ONLY answer questions related to ${p.name || 'Santhosh'}'s professional background, skills, projects, and experience listed below.
2. KEYWORD RULE (CRITICAL): If the visitor sends any short or keyword-style message like "linkedin", "github", "resume", "cv", "project", "projects", "skills", "experience", "education", "certifications", "contact", "link", "url", "social", etc., treat it as a REQUEST to share that information. DO NOT refuse it. Always respond helpfully with the relevant info or link.
3. If the visitor asks a question CLEARLY unrelated to ${p.name || 'Santhosh'}'s profile (like writing code for them, general knowledge, math, weather, jokes, random facts, etc.), politely decline by saying EXACTLY: "I am programmed to only discuss Santhosh's professional background, skills, and projects."
4. Speak highly of his skills. Keep answers concise, friendly, and easy to read. Do not invent information.
5. HR PITCH RULE (CRITICAL): If asked "why hire him", give a short, punchy, confident pitch — maximum 3 impactful bullet points. Make it professional yet energetic.

MARKDOWN LINKS DIRECTIVE (CRITICAL):
If the user asks for any links, social profiles, resume, or contact info, respond with the correct markdown link:
- For LinkedIn: [LinkedIn Profile](${p.linkedin || 'https://www.linkedin.com/in/santhosh-s-323454'})
- For GitHub: [GitHub Profile](${p.github || 'https://github.com/Santhosh323454'})
- For LeetCode: [LeetCode Profile](${p.leetcode || '#'})
- For Resume: [Open Resume](/resume) or [Download CV](/cv)
- For Contact: [Contact Page](/contact) or [Hire Me](#contact)
- For Projects: [View Projects](/projects)
Always format links as [Link Text](URL). Do not use plain text URLs.

LIVE PROFILE DATA (from database — always use this, never invent):
${profileStr}

TECHNICAL SKILLS:
${skillsStr}

KEY PROJECTS (first 2 only):
${projectsStr}

CERTIFICATIONS:
${certsStr}`;

        const strictHistory = [
            {
                role: 'user',
                parts: [{ text: `Instructions: ${dynamicContext} ` }]
            },
            {
                role: 'model',
                parts: [{ text: "Understood. I will act strictly as Santhosh's Professional Assistant and will refuse to answer any questions unrelated to the provided portfolio data." }]
            },
            ...messages.filter(m => m.role !== 'system').slice(1).map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }))
        ];

        let lastError = null;
        for (const modelName of tryList) {
            try {
                console.log('[ChatBot] Trying model:', modelName);
                const model = genAI.getGenerativeModel({ model: modelName });
                const chat = model.startChat({ history: strictHistory });
                const result = await chat.sendMessage(userMessage);
                const text = result.response.text();

                // Update active model silently if it changed
                if (modelName !== resolvedModel) {
                    setResolvedModel(modelName);
                }
                setMessages(prev => [...prev, { role: 'assistant', content: text }]);
                setIsLoading(false);
                return; // success — stop trying more models
            } catch (error) {
                lastError = error;
                const isAuthError = error.message && error.message.includes('API key not valid');
                console.warn(`[ChatBot] Model ${modelName} failed:`, error.message);
                if (isAuthError) {
                    break; // Wrong API key — no point trying other models
                }
                continue; // quota, 404, 500, or any other error — try next model
            }
<<<<<<< HEAD

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

            let errorMessage = "Chatbot was comming soon...";
            if (error.message && error.message.includes('API key not valid')) {
                errorMessage = "API Configuration Error. Please verify the Gemini API key in your .env file.";
            } else if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
                errorMessage = "Model Error: The 'gemini-2.5-flash' model could not be found via the endpoint. Check your API permissions.";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
=======
>>>>>>> 1dc472f (Fix: Enabled dynamic context and fixed model 404 error)
        }

        // All models failed
        console.error('Chat Error (all models failed):', lastError);
        let errorMessage = "Sorry, I hit an error connecting to the AI. Please try again.";
        if (lastError?.message?.includes('API key not valid')) {
            errorMessage = "API Configuration Error. Please verify the Gemini API key in your .env file.";
        } else if (lastError?.message?.includes('429') || lastError?.message?.includes('quota')) {
            errorMessage = "All AI models are currently rate-limited. Please wait a moment and try again!";
        }
        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        setIsLoading(false);
    };


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-36 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] flex flex-col pointer-events-auto overflow-hidden"
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
                {messages.map((msg, idx) => {
                    // System messages (model detection info) shown as a centered info card
                    if (msg.role === 'system') {
                        return (
                            <div key={idx} className="flex justify-center">
                                <div className="max-w-full w-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded font-mono text-[11px]" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="space-y-0.5 mt-1" {...props} />,
                                            li: ({ node, ...props }) => <li {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-orange-500 text-white rounded-br-sm whitespace-pre-wrap'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                                    }`}
                            >
                                {msg.role === 'user' ? (
                                    <>{msg.content}</>
                                ) : (
                                    <div className="space-y-2">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                a: ({ node, ...props }) => {
                                                    const path = props.href;
                                                    return (
                                                        <a
                                                            href={path}
                                                            target={path?.startsWith('http') ? "_blank" : "_self"}
                                                            rel={path?.startsWith('http') ? "noopener noreferrer" : ""}
                                                            className="text-brand-orange underline underline-offset-2 hover:opacity-80 font-semibold cursor-pointer"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();

                                                                // External links — open in new tab
                                                                if (path?.startsWith('http')) {
                                                                    window.open(path, '_blank', 'noopener,noreferrer');
                                                                    return;
                                                                }

                                                                // Resume / CV download
                                                                if (path === '/resume' || path === '/cv') {
                                                                    const resumeUrl = profile?.resumeUrl || (Array.isArray(profile) && profile[0]?.resumeUrl);
                                                                    if (resumeUrl) {
                                                                        forceDownload(resumeUrl, 'Santhosh_S_Resume.pdf');
                                                                    } else {
                                                                        alert("Resume not available currently. Please contact Santhosh directly.");
                                                                    }
                                                                    return;
                                                                }

                                                                // Scroll to sections
                                                                const sectionMap = {
                                                                    '/projects': 'projects',
                                                                    '#projects': 'projects',
                                                                    '/contact': 'contact',
                                                                    '#contact': 'contact',
                                                                };
                                                                const sectionId = sectionMap[path] || (path?.startsWith('#') ? path.slice(1) : null);
                                                                if (sectionId) {
                                                                    onClose();
                                                                    setTimeout(() => {
                                                                        const el = document.getElementById(sectionId);
                                                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                                    }, 300);
                                                                    return;
                                                                }

                                                                // Fallback navigation
                                                                window.location.href = path;
                                                            }}
                                                        >{props.children}</a>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
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
                    autoFocus
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
