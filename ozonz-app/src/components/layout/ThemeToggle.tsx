import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button
      className="theme-toggle bg-primary text-on-primary cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      id="theme-toggle"
      title="Toggle Theme"
      aria-label="Toggle Theme"
      onClick={toggleTheme}
      style={{
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        right: 'calc(1.25rem + env(safe-area-inset-right, 0px))',
      }}
    >
      <span className="material-symbols-outlined text-2xl" id="theme-icon">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};
