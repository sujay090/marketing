import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, themes, setSpecificTheme, getCurrentTheme } = useTheme();

    const handleToggle = () => setIsOpen(!isOpen);

    const handleThemeChange = (themeName) => {
        setSpecificTheme(themeName);
        setIsOpen(false);
    };

    const getThemeIcon = (themeName) => {
        if (themeName.includes('glass')) return 'bi-droplet-half';
        if (themeName.includes('neon')) return 'bi-lightning-charge';
        if (themeName.includes('professional')) return 'bi-briefcase';
        return themeName.includes('dark') ? 'bi-moon-stars-fill' : 'bi-sun-fill';
    };

    const currentTheme = getCurrentTheme();

    return (
        <div className="theme-toggle-container position-relative">
            <button
                className="theme-toggle-btn btn btn-outline-primary border-0 p-3 rounded-circle shadow-lg"
                onClick={handleToggle}
                style={{
                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                    border: 'none',
                    transition: 'all 0.3s ease',
                    transform: isOpen ? 'scale(1.1)' : 'scale(1)',
                }}
            >
                <i className={`bi ${getThemeIcon(theme)} text-white fs-5`}></i>
            </button>

            {isOpen && (
                <>
                    <div
                        className="theme-overlay position-fixed top-0 start-0 w-100 h-100"
                        style={{ zIndex: 1040 }}
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div
                        className="theme-menu position-absolute end-0 mt-2 p-3 rounded-3 shadow-lg"
                        style={{
                            background: currentTheme.surface,
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${currentTheme.primary}20`,
                            minWidth: '280px',
                            zIndex: 1050,
                            animation: 'slideDown 0.3s ease-out'
                        }}
                    >
                        <div className="mb-3">
                            <h6 className="text-center mb-3 fw-bold" style={{ color: currentTheme.text }}>
                                <i className="bi bi-palette me-2"></i>
                                Choose Theme
                            </h6>
                        </div>

                        <div className="row g-2">
                            {Object.entries(themes).map(([themeName, themeData]) => (
                                <div key={themeName} className="col-6">
                                    <button
                                        className={`theme-option w-100 p-3 rounded-3 border-0 position-relative overflow-hidden ${theme === themeName ? 'active' : ''}`}
                                        onClick={() => handleThemeChange(themeName)}
                                        style={{
                                            background: themeData.background.includes('gradient')
                                                ? themeData.background
                                                : `linear-gradient(135deg, ${themeData.primary}, ${themeData.accent})`,
                                            transition: 'all 0.3s ease',
                                            transform: theme === themeName ? 'scale(1.05)' : 'scale(1)',
                                            boxShadow: theme === themeName
                                                ? `0 8px 25px ${themeData.primary}40`
                                                : '0 4px 15px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <div
                                            className="theme-preview p-2 rounded-2 mb-2"
                                            style={{
                                                background: themeData.surface,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${themeData.primary}30`
                                            }}
                                        >
                                            <i className={`bi ${getThemeIcon(themeName)} fs-4`} style={{ color: themeData.text }}></i>
                                        </div>
                                        <small className="d-block fw-semibold" style={{ color: themeData.text }}>
                                            {themeData.name}
                                        </small>
                                        {theme === themeName && (
                                            <div
                                                className="position-absolute top-0 end-0 p-1"
                                                style={{ color: themeData.text }}
                                            >
                                                <i className="bi bi-check-circle-fill"></i>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .theme-toggle-btn:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
        }
        
        .theme-option:hover {
          transform: scale(1.05) !important;
        }
        
        .theme-option.active {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.08); }
        }
      `}</style>
        </div>
    );
};

export default ThemeToggle;