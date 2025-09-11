import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Enhanced themes with beautiful gradients and modern colors
    const themes = {
        "modern-light": {
            name: "Modern Light",
            primary: "#3b82f6",
            secondary: "#64748b",
            accent: "#06b6d4",
            success: "#10b981",
            warning: "#f59e0b",
            danger: "#ef4444",
            info: "#0ea5e9",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            surface: "rgba(255, 255, 255, 0.8)",
            surfaceSolid: "#ffffff",
            text: "#1e293b",
            textSecondary: "#64748b",
            border: "#e2e8f0",
            shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            glassEffect: "backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);",
            isDark: false
        },
        "modern-dark": {
            name: "Modern Dark",
            primary: "#60a5fa",
            secondary: "#94a3b8",
            accent: "#22d3ee",
            success: "#34d399",
            warning: "#fbbf24",
            danger: "#f87171",
            info: "#38bdf8",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
            surface: "rgba(30, 41, 59, 0.8)",
            surfaceSolid: "#1e293b",
            text: "#f1f5f9",
            textSecondary: "#94a3b8",
            border: "#334155",
            shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            glassEffect: "backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);",
            isDark: true
        },
        "cyberpunk-dark": {
            name: "Cyberpunk",
            primary: "#00ff88",
            secondary: "#00ccff",
            accent: "#ff0080",
            success: "#00ff41",
            warning: "#ffff00",
            danger: "#ff073a",
            background: "linear-gradient(135deg, #000814 0%, #001d3d 50%, #003566 100%)",
            surface: "rgba(0, 29, 61, 0.9)",
            surfaceSolid: "#001d3d",
            text: "#ffffff",
            textSecondary: "#00ccff",
            border: "#003566",
            shadow: "0 0 40px rgba(0, 255, 136, 0.3)",
            glassEffect: "backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);",
            isDark: true
        },
        "ocean-blue": {
            name: "Ocean Blue",
            primary: "#0ea5e9",
            secondary: "#0284c7",
            accent: "#06b6d4",
            success: "#059669",
            warning: "#d97706",
            danger: "#dc2626",
            background: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)",
            surface: "rgba(7, 89, 133, 0.8)",
            surfaceSolid: "#075985",
            text: "#f0f9ff",
            textSecondary: "#bae6fd",
            border: "#0369a1",
            shadow: "0 25px 50px -12px rgba(14, 165, 233, 0.25)",
            glassEffect: "backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);",
            isDark: true
        },
        "royal-purple": {
            name: "Royal Purple",
            primary: "#8b5cf6",
            secondary: "#7c3aed",
            accent: "#a855f7",
            success: "#10b981",
            warning: "#f59e0b",
            danger: "#ef4444",
            background: "linear-gradient(135deg, #581c87 0%, #7c2d12 25%, #7c3aed 50%, #a855f7 100%)",
            surface: "rgba(88, 28, 135, 0.9)",
            surfaceSolid: "#7c3aed",
            text: "#faf5ff",
            textSecondary: "#e9d5ff",
            border: "#8b5cf6",
            shadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)",
            glassEffect: "backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);",
            isDark: true
        },
        "minimalist-light": {
            name: "Minimalist Light",
            primary: "#374151",
            secondary: "#6b7280",
            accent: "#3b82f6",
            success: "#059669",
            warning: "#d97706",
            danger: "#dc2626",
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            surface: "rgba(255, 255, 255, 0.9)",
            surfaceSolid: "#ffffff",
            text: "#111827",
            textSecondary: "#6b7280",
            border: "#e5e7eb",
            shadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            glassEffect: "backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);",
            isDark: false
        }
    };

    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem("theme");
            // Validate saved theme exists in themes object
            if (savedTheme && themes[savedTheme]) {
                return savedTheme;
            }
        } catch (error) {
            console.warn("Error reading theme from localStorage:", error);
        }
        return "modern-dark";
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme && themes[savedTheme]) {
                return themes[savedTheme].isDark;
            }
        } catch (error) {
            console.warn("Error reading theme from localStorage:", error);
        }
        return true;
    });

    useEffect(() => {
        // Ensure theme exists, fallback to modern-dark if not
        const currentTheme = themes[theme] || themes["modern-dark"];
        if (!currentTheme) {
            console.error("Theme not found:", theme);
            return;
        }

        const root = document.documentElement;

        // Set CSS custom properties for modern design system
        root.style.setProperty('--color-primary', currentTheme.primary);
        root.style.setProperty('--color-secondary', currentTheme.secondary);
        root.style.setProperty('--color-accent', currentTheme.accent);
        root.style.setProperty('--color-success', currentTheme.success);
        root.style.setProperty('--color-warning', currentTheme.warning);
        root.style.setProperty('--color-danger', currentTheme.danger);
        root.style.setProperty('--color-background', currentTheme.background);
        root.style.setProperty('--color-surface', currentTheme.surface);
        root.style.setProperty('--color-surface-solid', currentTheme.surfaceSolid);
        root.style.setProperty('--color-text', currentTheme.text);
        root.style.setProperty('--color-text-secondary', currentTheme.textSecondary);
        root.style.setProperty('--color-border', currentTheme.border);
        root.style.setProperty('--shadow', currentTheme.shadow);
        root.style.setProperty('--glass-effect', currentTheme.glassEffect);

        // Set Bootstrap theme
        document.documentElement.setAttribute("data-bs-theme", currentTheme.isDark ? "dark" : "light");

        // Apply background
        document.body.style.background = currentTheme.background;
        document.body.style.minHeight = '100vh';
        document.body.style.color = currentTheme.text;

        // Save to localStorage
        try {
            localStorage.setItem("theme", theme);
        } catch (error) {
            console.warn("Error saving theme to localStorage:", error);
        }
        setIsDarkMode(currentTheme.isDark);
    }, [theme, themes]);

    const toggleTheme = () => {
        const currentTheme = themes[theme] || themes["modern-dark"];
        if (!currentTheme) return;

        const currentIsDark = currentTheme.isDark;
        const availableThemes = Object.keys(themes).filter(t => themes[t] && themes[t].isDark !== currentIsDark);
        const nextTheme = availableThemes[0] || (currentIsDark ? "modern-light" : "modern-dark");
        setTheme(nextTheme);
    };

    const resetToSystemTheme = () => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "modern-dark" : "modern-light");
    };

    const setSpecificTheme = (themeName) => {
        if (themes[themeName]) {
            setTheme(themeName);
        } else {
            console.warn("Theme not found:", themeName, "Available themes:", Object.keys(themes));
        }
    };

    const getCurrentTheme = () => themes[theme] || themes["modern-dark"];

    return (
        <ThemeContext.Provider value={{
            theme,
            themes,
            isDarkMode,
            toggleTheme,
            setSpecificTheme,
            getCurrentTheme,
            resetToSystemTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
