// teamflow/frontend/src/App.tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './AppRoutes';
import { useMemo } from 'react';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      // ... rest of your theme config
    },
    // ... rest of your theme
  }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <AuthProvider>
          <Router>
            <AppRoutes toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
          </Router>
        </AuthProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;