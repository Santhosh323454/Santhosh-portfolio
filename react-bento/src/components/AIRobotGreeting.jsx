import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { CURRENT_VERSION } from './ThemeContext';
import ChatBot from './ChatBot';

export default function AIRobotGreeting() {
    const [profile] = useRealtimeData('profile');
    const [greeting, setGreeting] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [isMessageSent, setIsMessageSent] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Animation Phase State: 'intro' (center screen) -> 'idle' (bottom right)
    const [phase, setPhase] = useState('idle');

    useEffect(() => {
        // Check if the user has already seen the cinematic intro this session
        const hasSeenIntro = sessionStorage.getItem('hasSeenRobotIntro');

        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning! ☀️ Welcome to Santhosh's Creative Space.");
        else if (hour < 18) setGreeting("Good Afternoon! ☕ Hope you are having a productive day.");
        else setGreeting("Good Evening! 🌙 Thanks for checking out my portfolio.");

        if (!hasSeenIntro) {
            // Play Cinematic Intro
            setPhase('intro');
            setShowMessage(true);
            sessionStorage.setItem('hasSeenRobotIntro', 'true');

            // Wait 3 cursor seconds, then transition to corner
            setTimeout(() => {
                setPhase('idle');
                // The message stays up for 2 more seconds while in the corner, then hides
                setTimeout(() => {
                    setShowMessage(false);
                }, 2000);
            }, 3000);
        } else {
            // Standard corner load
            setPhase('idle');
            setTimeout(() => {
                setShowMessage(true);
                setTimeout(() => setShowMessage(false), 5000);
            }, 1000);
        }

        // Hide on scroll (only if in idle phase)
        const handleScroll = () => {
            if (window.scrollY > 150) {
                setShowMessage(false);
            }
        };
        window.addEventListener('scroll', handleScroll);

        // Listen for global contact message event
        const handleContactSent = () => {
            setIsMessageSent(true);
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setIsMessageSent(false);
            }, 5000);
        };
        window.addEventListener('contactMessageSent', handleContactSent);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('contactMessageSent', handleContactSent);
        };
    }, []);

    const displayText = isMessageSent
        ? "Got it! Your message is in Santhosh's inbox."
        : greeting;

    return (
        <>
            {/* Cinematic Background Blur Overlay */}
            <AnimatePresence>
                {phase === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-[90] bg-black/20 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
                {/* 
                    We use framer-motion's layout animate to seamlessly 
                    transition the container from center screen to bottom right 
                */}
                <motion.div
                    layout
                    initial={phase === 'intro' ? { scale: 0, y: 50 } : { y: 100, opacity: 0 }}
                    animate={
                        phase === 'intro'
                            ? { scale: 1, y: 0, opacity: 1 } // Center Grand Entry
                            : { scale: 1, y: 0, opacity: 1 } // Idle 
                    }
                    transition={{
                        type: "spring",
                        stiffness: phase === 'intro' ? 100 : 80,
                        damping: phase === 'intro' ? 15 : 20,
                        duration: 1
                    }}
                    className={`absolute flex flex-col items-end pointer-events-none ${phase === 'intro'
                        ? 'inset-x-0 inset-y-0 items-center justify-center'
                        : 'bottom-6 right-6'
                        }`}
                >

                    {/* Chat Bubble */}
                    <AnimatePresence>
                        {showMessage && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                className={`pointer-events-auto bg-white dark:bg-gray-800 text-brand-dark dark:text-white p-4 pr-10 rounded-2xl shadow-2xl border border-brand-border dark:border-brand-darkborder relative ${phase === 'intro' ? 'text-center max-w-sm rounded-b-sm mb-6' : 'max-w-[250px] rounded-br-sm mr-6 mb-4'
                                    }`}
                            >
                                {phase === 'idle' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMessage(false);
                                        }}
                                        className="absolute top-2 right-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors z-10 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <p className={`${phase === 'intro' ? 'text-lg font-bold' : 'text-[15px] font-medium'} leading-relaxed`}>
                                    {displayText}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Robot Avatar */}
                    <motion.button
                        layout
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => {
                            if (phase === 'idle' && !showMessage) {
                                setGreeting("Click me to send a message!");
                                setShowMessage(true);
                            }
                        }}
                        onMouseLeave={() => {
                            if (phase === 'idle' && greeting === "Click me to send a message!") {
                                setShowMessage(false);
                            }
                        }}
                        onClick={() => {
                            if (phase === 'idle') {
                                setIsChatOpen(!isChatOpen);
                                setShowMessage(false);
                            }
                        }}
                        className={`pointer-events-auto flex items-center justify-center relative transition-all ${phase === 'intro'
                            ? 'w-72 h-72 drop-shadow-[0_20px_50px_rgba(255,107,0,0.6)]'
                            : 'w-32 h-32 mr-2 mb-2 drop-shadow-[0_10px_30px_rgba(255,107,0,0.5)]'
                            }`}
                    >
                        {/* 3D Robot Image Float Animation */}
                        <motion.img
                            src={profile?.robotImageUrl ? `${profile?.robotImageUrl}?v=${CURRENT_VERSION}` : `/robot.png?v=${CURRENT_VERSION}`}
                            alt="AI Robot"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="w-full h-full object-contain drop-shadow-xl scale-125"
                        />

                        {/* Pulse ring when message sent */}
                        {isMessageSent && (
                            <motion.div
                                className="absolute inset-0 border-4 border-brand-orange rounded-full"
                                animate={{ scale: [1, 1.5, 2], opacity: [1, 0.5, 0] }}
                                transition={{ duration: 1, repeat: 2 }}
                            />
                        )}
                    </motion.button>
                </motion.div>
            </div>

            <AnimatePresence>
                {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} />}
            </AnimatePresence>
        </>
    );
}
