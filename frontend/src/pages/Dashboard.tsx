// teamflow/frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  Chip,
  Card,
  CardContent,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder,
  Groups,
  CalendarMonth,
  BarChart,
  Settings,
  Logout,
  Add,
  People,
  Assignment,
  CheckCircle,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ProjectList from '../components/ProjectList';

const drawerWidth = 280;

interface DashboardProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleDarkMode, darkMode }) => {
  const { user, logout } = useAuth();
  // Dashboard doesn't directly store the projects list (ProjectList handles that). We only compute stats.
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTeamMembers: 0,
    activeProjects: 0,
    completedTasks: 0
  });

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      
      // Calculate real statistics
      const totalTeamMembers = data.reduce((acc: number, project: Project) => {
        // Count unique members across all projects (excluding duplicates)
        const projectMembers = new Set();
        projectMembers.add(project.owner._id);
        project.members.forEach((member: any) => projectMembers.add(member._id));
        return acc + projectMembers.size;
      }, 0);

      const activeProjects = data.length; // All projects are considered active for now
      
      setStats({
        totalProjects: data.length,
        totalTeamMembers,
        activeProjects,
        completedTasks: 0 // We'll calculate this when we have task data
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ 
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      borderRadius: 3,
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontSize: '1rem' }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            TeamFlow
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Project Management
          </Typography>
        </Box>

        <List sx={{ px: 2, mt: 2 }}>
          {[
            { text: 'Dashboard', icon: <DashboardIcon />, active: true },
            { text: 'Projects', icon: <Folder /> },
            { text: 'Team', icon: <Groups /> },
            { text: 'Calendar', icon: <CalendarMonth /> },
            { text: 'Analytics', icon: <BarChart /> },
            { text: 'Settings', icon: <Settings /> },
          ].map((item) => (
            <ListItem 
              key={item.text}
              disablePadding
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: item.active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: item.active ? 600 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: '#10b981',
                width: 40,
                height: 40,
                mr: 2
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="600">
                {user?.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<Logout />}
            onClick={logout}
            sx={{
              color: 'white',
              width: '100%',
              justifyContent: 'flex-start',
              pl: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, ml: `${drawerWidth}px` }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            backgroundColor: 'background.paper', 
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user?.name}!
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Analytics Cards */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3, 
            mb: 4,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Total Projects"
                value={stats.totalProjects}
                icon={<Folder sx={{ color: 'white', fontSize: 28 }} />}
                color="#667eea"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Team Members"
                value={stats.totalTeamMembers}
                icon={<People sx={{ color: 'white', fontSize: 28 }} />}
                color="#f093fb"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Active Projects"
                value={stats.activeProjects}
                icon={<CheckCircle sx={{ color: 'white', fontSize: 28 }} />}
                color="#4facfe"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <StatCard
                title="Tasks Completed"
                value={stats.completedTasks}
                icon={<Assignment sx={{ color: 'white', fontSize: 28 }} />}
                color="#43e97b"
              />
            </Box>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            {/* Projects Section - Takes 2/3 width on desktop */}
            <Box sx={{ 
              flex: { md: 2 }, 
              minWidth: 0 // Important for flexbox shrinking
            }}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                backgroundColor: 'background.paper'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="600">
                    Your Projects
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => {/* You can add new project logic here */}}
                  >
                    New Project
                  </Button>
                </Box>
                <ProjectList onProjectCreated={fetchProjects} />
              </Paper>
            </Box>

            {/* Sidebar - Takes 1/3 width on desktop */}
            <Box sx={{ 
              flex: { md: 1 },
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              {/* Quick Stats */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                backgroundColor: 'background.paper'
              }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Projects Created
                    </Typography>
                    <Chip label={stats.totalProjects} color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Team Members
                    </Typography>
                    <Chip label={stats.totalTeamMembers} color="secondary" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Collaboration
                    </Typography>
                    <Chip 
                      label={stats.totalTeamMembers > 1 ? "Active" : "Solo"} 
                      color={stats.totalTeamMembers > 1 ? "success" : "warning"} 
                      size="small" 
                    />
                  </Box>
                </Box>
              </Paper>
              
              {/* Productivity */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                backgroundColor: 'background.paper',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Workspace Health
                </Typography>
                <Box sx={{ py: 2 }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: stats.totalProjects > 0 ? 
                        'conic-gradient(#43e97b 60%, #e0e0e0 0)' : 
                        'conic-gradient(#e0e0e0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        backgroundColor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h5" fontWeight="700">
                        {stats.totalProjects > 0 ? '60%' : '0%'}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {stats.totalProjects > 0 ? 'Active workspace' : 'No projects yet'}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;