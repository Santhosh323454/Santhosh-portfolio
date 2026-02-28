import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
// This key ensures users get the latest version if we change it in code
const CURRENT_APP_VERSION = '1.0.1';

export function ThemeProvider({ children }) {
    // 1. Strict White Theme Default for new visitors
    // Initial state is ALWAYS false (light mode) unless they explicitly toggled it before
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('portfolio-theme');
            return savedTheme === 'dark'; // Strict white default
        } catch {
            return false; // Fallback to white default
        }
    });

    // 2. Real-time Update Logic (Version check)
    useEffect(() => {
        const checkVersion = () => {
            const storedVersion = localStorage.getItem('portfolio-version');
            if (storedVersion !== CURRENT_APP_VERSION) {
                // App has updated! Clear relevant caches (optional) and save new version
                localStorage.setItem('portfolio-version', CURRENT_APP_VERSION);

                // Force a hard reload to fetch new bundles dynamically
                // We ensure it only happens once per version bump
                if (storedVersion !== null) {
                    window.location.reload(true);
                }
            }
        };
        checkVersion();
    }, []);

    // 3. Apply theme to HTML tag for Tailwind
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('portfolio-theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('portfolio-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
