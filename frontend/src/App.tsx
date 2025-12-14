import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { DashboardProvider } from './context/DashboardContext';
import AppRoutes from './AppRoutes';
import { useDarkMode } from './hooks/useDarkMode';
import { getLightTheme, getDarkTheme } from './theme';
import { useEffect, useMemo } from 'react';

function App() {
  const { darkMode, toggleDarkMode, mounted } = useDarkMode();

  // Create theme based on dark mode
  const theme = useMemo(
    () => (darkMode ? getDarkTheme() : getLightTheme()),
    [darkMode]
  );

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 ${darkMode ? 'dark' : ''}`}>
        <AuthProvider>
          <SocketProvider>
            <DashboardProvider>
              <Router>
                <AppRoutes toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
              </Router>
            </DashboardProvider>
          </SocketProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;