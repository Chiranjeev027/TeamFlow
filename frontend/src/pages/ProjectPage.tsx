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
import { ArrowBack, Brightness4, Brightness7, FileDownload } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';
import ActivityFeed from '../components/ActivityFeed';

interface ProjectPageProps {
  toggleDarkMode?: () => void;
  darkMode?: boolean;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ toggleDarkMode, darkMode }) => {
  const { projectId: _projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      width: '100%',
      // REMOVE the hardcoded background color
    }}>
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
          
          {/* Dark Mode Toggle - Make sure this is included */}
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
          <Button color="inherit" startIcon={<FileDownload />} onClick={async () => {
            // export project data (project details & tasks)
            const token = localStorage.getItem('token');
            const [projectRes, tasksRes] = await Promise.all([
              fetch(`/api/projects/${_projectId}`, { headers: { Authorization: `Bearer ${token}` } }),
              fetch(`/api/tasks/project/${_projectId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const projectData = projectRes.ok ? await projectRes.json() : null;
            const tasksData = tasksRes.ok ? await tasksRes.json() : [];
            const data = { project: projectData, tasks: tasksData, exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectData?.project?.name || 'project'}-export.json`;
            a.click();
          }}>
            Export
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3, width: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' }, gap: 3 }}>
        <Box>
          <TaskBoard />
        </Box>
        <Box>
          <ActivityFeed projectId={_projectId!} />
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectPage;