// teamflow/frontend/src/hooks/useDarkMode.ts
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('teamflow-dark-mode');
      if (stored) {
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
  }, []);

  // Save to localStorage when darkMode changes
  useEffect(() => {
    localStorage.setItem('teamflow-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(current => !current);
  };

  return { darkMode, toggleDarkMode };
};