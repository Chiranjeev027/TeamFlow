// teamflow/frontend/src/pages/Dashboard.tsx
import React from 'react';
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
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder,
  Groups,
  CalendarMonth,
  BarChart,
  Settings,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ProjectList from '../components/ProjectList';

const drawerWidth = 280;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
            { text: 'Dashboard', icon: <DashboardIcon /> },
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
                <ListItemText primary={item.text} />
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
            backgroundColor: 'white', 
            color: 'grey.900',
            borderBottom: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Projects
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="grey.600">
                Welcome, {user?.name}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <ProjectList />
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;