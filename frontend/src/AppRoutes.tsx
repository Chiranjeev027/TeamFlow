import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';

const AppRoutes: React.FC = () => {
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
        element={user ? <Dashboard /> : <Navigate to="/auth" />} 
      />
      <Route 
        path="/project/:projectId" 
        element={user ? <ProjectPage /> : <Navigate to="/auth" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;