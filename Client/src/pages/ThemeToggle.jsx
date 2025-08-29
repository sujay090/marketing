import React, { useState } from 'react';

const ThemeToggle = ({ toggleTheme, currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { name: 'Light', icon: 'bi-sun', value: 'light' },
    { name: 'Dark', icon: 'bi-moon-stars', value: 'dark' },
  ];

  const handleToggle = () => setIsOpen(!isOpen);

  const handleThemeChange = (theme) => {
    toggleTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="theme-toggle">
      <button className="theme-toggle-btn btn btn-link" onClick={handleToggle}>
        <i className={`bi ${themes.find(t => t.value === currentTheme)?.icon} theme-icon`}></i>
      </button>
      {isOpen && (
        <div className="theme-menu">
          {themes.map((theme) => (
            <button
              key={theme.value}
              className="theme-menu-item"
              onClick={() => handleThemeChange(theme.value)}
            >
              <i className={`bi ${theme.icon}`}></i>
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;