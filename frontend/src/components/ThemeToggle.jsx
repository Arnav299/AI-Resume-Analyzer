import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-surface text-yellow-400 hover:bg-surface-hover hover:shadow-[0_0_15px_rgba(250,204,21,0.3)]'
          : 'bg-surface-hover text-content-secondary hover:bg-surface-hover hover:shadow-sm'
      } ${className}`}
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
