import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';

export default function NavBar() {
    const [isDark, setIsDark] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
        >
            <div className="bg-white/80 dark:bg-brand-darkcard/90 backdrop-blur-lg border border-brand-border dark:border-brand-darkborder shadow-ouali-card dark:shadow-ouali-darkcard rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-4 md:gap-16 w-full max-w-3xl transition-colors">

                {/* Logo */}
                <div className="font-extrabold text-lg sm:text-xl tracking-tight text-brand-dark dark:text-white transition-colors">
                    Portfolio<span className="text-brand-orange">.</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-brand-gray dark:text-gray-400">
                    <a href="#" className="text-brand-dark dark:text-white transition-colors">Home</a>
                    <a href="#about" className="hover:text-brand-dark dark:hover:text-white transition-colors">About</a>
                    <a href="#skills" className="hover:text-brand-dark dark:hover:text-white transition-colors">Skills</a>
                    <a href="#projects" className="hover:text-brand-dark dark:hover:text-white transition-colors">Projects</a>
                    <a href="#contact" className="hover:text-brand-dark dark:hover:text-white transition-colors">Contact</a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="hidden md:block bg-brand-orange text-white text-xs font-bold px-4 py-2 rounded-full shadow-ouali-btn hover:-translate-y-0.5 transition-transform">
                        Hire Me
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 text-brand-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                </div>

            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed inset-0 z-[100] bg-white dark:bg-brand-darkcard flex flex-col items-center justify-center overscroll-none"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-8 right-8 p-2 text-brand-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X size={28} />
                        </button>

                        <div className="flex flex-col items-center gap-8 text-2xl font-bold text-brand-dark dark:text-white">
                            <a href="#" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors">Home</a>
                            <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors">About</a>
                            <a href="#skills" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors">Skills</a>
                            <a href="#projects" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors">Projects</a>
                            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors">Contact</a>

                            <button className="mt-4 bg-brand-orange text-white text-lg font-bold px-8 py-3 rounded-full shadow-ouali-btn hover:-translate-y-0.5 transition-transform" onClick={() => setIsMenuOpen(false)}>
                                Hire Me
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
