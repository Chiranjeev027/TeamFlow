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
  CircularProgress,
  AvatarGroup
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

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleDarkMode, darkMode }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTeamMembers: 0,
    activeProjects: 0,
    completedTasks: 0
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<TeamMember[]>([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects to calculate stats
      const projectsResponse = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const projects = await projectsResponse.json();

      // Calculate unique team members across all projects
      const allTeamMembers = new Map();
      
      projects.forEach((project: Project) => {
        // Add owner
        if (!allTeamMembers.has(project.owner._id)) {
          allTeamMembers.set(project.owner._id, {
            _id: project.owner._id,
            name: project.owner.name,
            email: project.owner.email
          });
        }
        
        // Add members
        project.members.forEach((member: any) => {
          if (!allTeamMembers.has(member._id)) {
            allTeamMembers.set(member._id, {
              _id: member._id,
              name: member.name,
              email: member.email
            });
          }
        });
      });

      const uniqueTeamMembers = Array.from(allTeamMembers.values());
      
      setStats({
        totalProjects: projects.length,
        totalTeamMembers: uniqueTeamMembers.length,
        activeProjects: projects.length, // All projects considered active for now
        completedTasks: 0 // We'll calculate this when we have task data
      });

      setTeamMembers(uniqueTeamMembers);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch online users from all projects (you'll need to implement this endpoint)
  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      // This would be a new endpoint that returns currently online users across user's projects
      const response = await fetch('/api/users/online', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const onlineUsers = await response.json();
        setOnlineUsers(onlineUsers);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchOnlineUsers();
    
    // Set up interval to refresh online users
    const interval = setInterval(fetchOnlineUsers, 30000); // Every 30 seconds
    return () => clearInterval(interval);
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

  // Team Collaboration Widget - Shows real team members
  const TeamCollaborationWidget = () => (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3,
      backgroundColor: 'background.paper'
    }}>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Team Collaboration
      </Typography>
      
      {/* Online Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
          <Typography variant="body2">
            {onlineUsers.length} of {teamMembers.length} online
          </Typography>
        </Box>
      </Box>

      {/* Team Members List */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Your Team
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {teamMembers.slice(0, 3).map((member) => (
            <Box key={member._id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  fontSize: '0.8rem',
                  bgcolor: member._id === user?.id ? 'primary.main' : 'secondary.main'
                }}
              >
                {member.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight="500">
                  {member.name} {member._id === user?.id && '(You)'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {member.email}
                </Typography>
              </Box>
              <Chip 
                label={onlineUsers.some(u => u._id === member._id) ? "Online" : "Offline"} 
                size="small" 
                color={onlineUsers.some(u => u._id === member._id) ? "success" : "default"} 
                variant="outlined"
              />
            </Box>
          ))}
          
          {teamMembers.length > 3 && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
              +{teamMembers.length - 3} more team members
            </Typography>
          )}
        </Box>
      </Box>

      {/* Quick Team Actions */}
      <Button 
        variant="outlined" 
        size="small" 
        fullWidth 
        startIcon={<Groups />}
        onClick={() => {/* Navigate to team management */}}
      >
        Manage Team
      </Button>
    </Paper>
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

        {/* Sidebar Team Status */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
          
          {/* Team Online Status */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', opacity: 0.8, mb: 1 }}>
              Team Online
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
                {teamMembers.slice(0, 3).map((member) => (
                  <Avatar 
                    key={member._id}
                    sx={{ 
                      bgcolor: onlineUsers.some(u => u._id === member._id) ? 'success.main' : 'grey.500'
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                {onlineUsers.length}/{teamMembers.length} online
              </Typography>
            </Box>
          </Box>

          {/* User Info and Logout */}
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
              minWidth: 0
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
                  >
                    New Project
                  </Button>
                </Box>
                <ProjectList onProjectCreated={fetchDashboardData} />
              </Paper>
            </Box>

            {/* Sidebar - Takes 1/3 width on desktop */}
            <Box sx={{ 
              flex: { md: 1 },
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              {/* Team Collaboration Widget */}
              <TeamCollaborationWidget />
              
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
                      label={stats.totalTeamMembers > 1 ? "Team" : "Solo"} 
                      color={stats.totalTeamMembers > 1 ? "success" : "warning"} 
                      size="small" 
                    />
                  </Box>
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