// teamflow/frontend/src/hooks/useDarkMode.ts
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage only on client side
  useEffect(() => {
    try {
      const stored = localStorage.getItem('teamflow-dark-mode');
      if (stored !== null) {
        setDarkMode(JSON.parse(stored));
      } else {
        // Check system preference if no stored value
        const systemPrefersDark = window.matchMedia && 
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(systemPrefersDark);
      }
    } catch (error) {
      console.error('Error reading dark mode preference:', error);
    }
    setMounted(true);
  }, []);

  // Save to localStorage when darkMode changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('teamflow-dark-mode', JSON.stringify(darkMode));
    }
  }, [darkMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(current => !current);
  };

  return { darkMode, toggleDarkMode, mounted };
};