import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// EXPORT this so other components can append it to image/resume URLs
export const CURRENT_VERSION = '1.0.2';

export function ThemeProvider({ children }) {
    // 1. Strict White Theme Default for new visitors
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('portfolio-theme');
            return savedTheme === 'dark'; // Strict white default
        } catch {
            return false;
        }
    });

    // 2. Real-time Auto-Reload Logic (Cache Busting)
    useEffect(() => {
        const checkVersion = () => {
            const storedVersion = localStorage.getItem('portfolio-version');

            if (storedVersion !== CURRENT_VERSION) {
                // App has updated! Clear localStorage to reset any cached states
                localStorage.clear();

                // Save the new version
                localStorage.setItem('portfolio-version', CURRENT_VERSION);

                // If they had a previous version, violently hard-refresh to clear browser cache
                if (storedVersion !== null) {
                    window.location.reload(true);
                }
            } else {
                // Also ensure the current version is explicitly set even on first visit
                localStorage.setItem('portfolio-version', CURRENT_VERSION);
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
