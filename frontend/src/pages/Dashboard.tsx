import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Paper,
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
import TeamManagementSidebar from '../components/TeamManagementSidebar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserSettings from '../components/UserSettings';

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

interface DashboardStats {
  totalProjects: number;
  totalTeamMembers: number;
  activeProjects: number;
  completedTasks: number;
  completionRate: number;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleDarkMode, darkMode }) => {
  const { user, logout } = useAuth();
  // Not currently using navigate/location in this page
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTeamMembers: 0,
    activeProjects: 0,
    completedTasks: 0,
    completionRate: 0
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  interface OnlineUser { userId: string; name: string; email?: string; projectId?: string }
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Menu items with navigation
  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'projects', text: 'Projects', icon: <Folder /> },
    { id: 'team', text: 'Team', icon: <Groups /> },
    { id: 'calendar', text: 'Calendar', icon: <CalendarMonth /> },
    { id: 'analytics', text: 'Analytics', icon: <BarChart /> },
    { id: 'settings', text: 'Settings', icon: <Settings /> },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects
      const projectsResponse = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const projectsData = await projectsResponse.json();
      // no long storing projects in state here; only calculate derived stats

      // Calculate unique team members across all projects
      const allTeamMembers = new Map();
      
      projectsData.forEach((project: Project) => {
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

      // Fetch analytics for completion rate
      const projectIds = projectsData.map((p: Project) => p._id);
      let totalCompletedTasks = 0;
      let totalTasks = 0;

      if (projectIds.length > 0) {
        const analyticsResponse = await fetch('/api/projects/analytics/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ projectIds })
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          
          totalCompletedTasks = Object.values(analyticsData).reduce((sum: number, projectAnalytics: any) => 
            sum + (projectAnalytics.completedTasks || 0), 0
          );
          
          totalTasks = Object.values(analyticsData).reduce((sum: number, projectAnalytics: any) => 
            sum + (projectAnalytics.totalTasks || 0), 0
          );
        }
      }

      const overallCompletionRate = totalTasks > 0 ? 
        Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

      setStats({
        totalProjects: projectsData.length,
        totalTeamMembers: uniqueTeamMembers.length,
        activeProjects: projectsData.length,
        completedTasks: totalCompletedTasks,
        completionRate: overallCompletionRate
      });

      setTeamMembers(uniqueTeamMembers);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/online', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const onlineUsersData = await response.json();
        setOnlineUsers(onlineUsersData);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchOnlineUsers();
    
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
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
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
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

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
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
                  subtitle={`${stats.activeProjects} active`}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <StatCard
                  title="Team Members"
                  value={stats.totalTeamMembers}
                  icon={<People sx={{ color: 'white', fontSize: 28 }} />}
                  color="#f093fb"
                  subtitle={`${teamMembers.filter(m => m.isOnline).length} online`}
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <StatCard
                  title="Tasks Completed"
                  value={stats.completedTasks}
                  icon={<CheckCircle sx={{ color: 'white', fontSize: 28 }} />}
                  color="#4facfe"
                  subtitle="Across all projects"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <StatCard
                  title="Overall Progress"
                  value={`${stats.completionRate}%`}
                  icon={<Assignment sx={{ color: 'white', fontSize: 28 }} />}
                  color="#43e97b"
                  subtitle="Completion rate"
                />
              </Box>
            </Box>

            {/* Projects Section */}
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
          </>
        );

      case 'projects':
        return (
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            backgroundColor: 'background.paper',
            minHeight: '600px'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" fontWeight="600">
                All Projects
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
        );

      case 'team':
        return <TeamManagementSidebar />;

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'settings':
        return <UserSettings />;

      case 'calendar':
        return (
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            backgroundColor: 'background.paper',
            textAlign: 'center',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <CalendarMonth sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Calendar View
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Project deadlines, milestones, and team availability will appear here.
            </Typography>
            <Button variant="outlined">
              Coming Soon
            </Button>
          </Paper>
        );

      default:
        return (
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            backgroundColor: 'background.paper'
          }}>
            <Typography variant="h5">Welcome to TeamFlow</Typography>
          </Paper>
        );
    }
  };

  const getSectionTitle = () => {
    const section = menuItems.find(item => item.id === activeSection);
    return section ? section.text : 'Dashboard';
  };

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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default', overflow: 'hidden' }}>
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
          {menuItems.map((item) => (
            <ListItem 
              key={item.id}
              disablePadding
              sx={{
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemButton
                onClick={() => setActiveSection(item.id)}
                sx={{
                  borderRadius: 2,
                  border: activeSection === item.id ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid transparent',
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
                    fontWeight: activeSection === item.id ? 600 : 400
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
                      bgcolor: onlineUsers.some(u => u.userId === member._id) ? 'success.main' : 'grey.500'
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
      <Box sx={{ flexGrow: 1, width: 'calc(100% - 280px)', overflow: 'auto' }}>
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
              {getSectionTitle()}
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
        
        <Box sx={{ mt: 4, pb: 4, px: 3, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {renderMainContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;