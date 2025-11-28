// teamflow/frontend/src/pages/ProjectPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import { ArrowBack, Brightness4, Brightness7 } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';

interface ProjectPageProps {
  toggleDarkMode?: () => void;
  darkMode?: boolean;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ toggleDarkMode, darkMode }) => {
  useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
            <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
            >
            <ArrowBack />
            </IconButton>
            <IconButton onClick={toggleDarkMode} color="inherit" sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TeamFlow
            </Typography>
            <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.name}
            </Typography>
            <Button color="inherit" onClick={logout}>
            Logout
            </Button>
        </Toolbar>
        </AppBar>
      
        <Box sx={{ p: 3, width: '100%', boxSizing: 'border-box' }}>
            <TaskBoard />
        </Box>
    </Box>
  );
};

export default ProjectPage;