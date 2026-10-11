import { useState, useEffect } from 'react';
import { ThemeMode } from '../types/weather';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('weathersense_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // modern deep navy SaaS theme by default
  });

  useEffect(() => {
    localStorage.setItem('weathersense_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
