// teamflow/frontend/src/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import TeamsPage from './pages/TeamsPage';
import CalendarPage from './pages/CalendarPage';
import Settings from './pages/Settings';
import AnalyticsPage from './pages/AnalyticsPage';


interface AppRoutesProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ toggleDarkMode, darkMode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={!user ? <AuthPage /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={user ? <Dashboard toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/project/:projectId"
        element={user ? <ProjectPage toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/teams"
        element={user ? <TeamsPage toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/calendar"
        element={user ? <CalendarPage toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/analytics"
        element={user ? <AnalyticsPage toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : <Navigate to="/auth" />}
      />
      <Route
        path="/settings"
        element={user ? <Settings toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : <Navigate to="/auth" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;