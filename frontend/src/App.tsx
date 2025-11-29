// teamflow/frontend/src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './AppRoutes';
import { useDarkMode } from './hooks/useDarkMode';
import { useEffect } from 'react';

function App() {
  const { darkMode, toggleDarkMode, mounted } = useDarkMode();

  useEffect(() => {
    // Apply dark mode class to html element for Tailwind
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Prevent flash of wrong theme by not rendering until mounted
  if (!mounted) {
    return (
      <div className="invisible">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 ${darkMode ? 'dark' : ''}`}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppRoutes toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;