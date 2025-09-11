import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
    const { theme, themes, setSpecificTheme, getCurrentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const currentTheme = getCurrentTheme();

    const themePresets = [
        { key: 'modern-light', icon: '☀️', description: 'Clean and bright' },
        { key: 'modern-dark', icon: '🌙', description: 'Elegant dark mode' },
        { key: 'cyberpunk-dark', icon: '🔥', description: 'Futuristic neon' },
        { key: 'ocean-blue', icon: '🌊', description: 'Deep ocean vibes' },
        { key: 'royal-purple', icon: '👑', description: 'Luxurious purple' },
        { key: 'minimalist-light', icon: '✨', description: 'Simple and clean' }
    ];

    return (
        <div className="position-relative">
            <button
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    color: currentTheme.text,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                }}
            >
                <i className="fas fa-palette"></i>
                <span className="d-none d-md-inline">{currentTheme.name}</span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} ms-1`}></i>
            </button>

            {isOpen && (
                <div
                    className="position-absolute top-100 end-0 mt-2 p-3 rounded-3 shadow-lg theme-selector-dropdown"
                    style={{
                        background: currentTheme.surface,
                        border: `1px solid ${currentTheme.border}`,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        minWidth: '280px',
                        zIndex: 1050,
                        animation: 'slideIn 0.2s ease-out',
                        opacity: 0,
                        transform: 'translateY(-10px)',
                        animationFillMode: 'forwards'
                    }}
                >
                    <h6 className="mb-3" style={{ color: currentTheme.text }}>
                        <i className="fas fa-swatchbook me-2"></i>
                        Choose Theme
                    </h6>

                    <div className="row g-2">
                        {themePresets.map((preset) => (
                            <div key={preset.key} className="col-6">
                                <button
                                    className="btn w-100 p-3 rounded-3 border-0 position-relative overflow-hidden theme-preset-btn"
                                    onClick={() => {
                                        setSpecificTheme(preset.key);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        background: themes[preset.key].background,
                                        color: themes[preset.key].text,
                                        minHeight: '80px',
                                        transition: 'all 0.3s ease',
                                        transform: theme === preset.key ? 'scale(0.95)' : 'scale(1)',
                                        boxShadow: theme === preset.key
                                            ? `0 0 0 2px ${currentTheme.primary}`
                                            : themes[preset.key].shadow,
                                        animation: theme === preset.key ? 'pulse 2s infinite' : 'none'
                                    }}
                                >
                                    <div className="d-flex flex-column align-items-center gap-1">
                                        <span style={{ fontSize: '1.5em' }}>{preset.icon}</span>
                                        <small className="fw-bold">{themes[preset.key].name}</small>
                                        <small
                                            className="opacity-75"
                                            style={{ fontSize: '0.7em', color: themes[preset.key].textSecondary }}
                                        >
                                            {preset.description}
                                        </small>
                                    </div>

                                    {theme === preset.key && (
                                        <div
                                            className="position-absolute top-0 end-0 p-1"
                                            style={{ color: currentTheme.primary }}
                                        >
                                            <i className="fas fa-check-circle"></i>
                                        </div>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    <hr style={{ borderColor: currentTheme.border, opacity: 0.3 }} />

                    <div className="d-flex justify-content-between align-items-center">
                        <small style={{ color: currentTheme.textSecondary }}>
                            Theme will be saved automatically
                        </small>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setIsOpen(false)}
                            style={{
                                borderColor: currentTheme.border,
                                color: currentTheme.textSecondary
                            }}
                        >
                            <i className="fas fa-times me-1"></i>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Add the CSS animations via a style tag */}
            <style dangerouslySetInnerHTML={{
                __html: `
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 ${currentTheme.primary}40; }
            70% { box-shadow: 0 0 0 8px ${currentTheme.primary}00; }
            100% { box-shadow: 0 0 0 0 ${currentTheme.primary}00; }
          }
          
          .theme-selector-dropdown {
            animation: slideIn 0.2s ease-out forwards;
          }
        `
            }} />
        </div>
    );
};

export default ThemeSelector;
