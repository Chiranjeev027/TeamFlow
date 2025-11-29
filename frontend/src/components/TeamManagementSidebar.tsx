import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  AvatarGroup,
  Chip,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Groups,
  PersonAdd,
  Wifi,
  WifiOff,
  AdminPanelSettings,
  Engineering,
  Visibility,
  MoreVert,
  Edit,
  Delete
} from '@mui/icons-material';
// import useAuth not required in this component
import InviteMemberDialog from './InviteMemberDialog';
import TeamPerformance from './TeamPerformance';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  isOnline: boolean;
  lastSeen: string;
  projects: number;
  tasksCompleted: number;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
}

// ProjectAnalytics removed: not used in this component; keep type in analytics helpers instead

const TeamManagementSidebar: React.FC = () => {
  // We don't currently need the user object here; omit to avoid unused var
  const [tabValue, setTabValue] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Fetch real team data
  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      // Fetch projects to get team members
      const projectsResponse = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const projects: Project[] = await projectsResponse.json();

      // Calculate unique team members across all projects
      const allTeamMembers = new Map();
      
      projects.forEach((project: Project) => {
        // Add owner as admin
        if (!allTeamMembers.has(project.owner._id)) {
          allTeamMembers.set(project.owner._id, {
            _id: project.owner._id,
            name: project.owner.name,
            email: project.owner.email,
            role: 'admin',
            projects: 1,
            tasksCompleted: 0
          });
        } else {
          const member = allTeamMembers.get(project.owner._id);
          member.projects += 1;
        }
        
        // Add members
        project.members.forEach((member: any) => {
          if (!allTeamMembers.has(member._id)) {
            allTeamMembers.set(member._id, {
              _id: member._id,
              name: member.name,
              email: member.email,
              role: 'member',
              projects: 1,
              tasksCompleted: 0
            });
          } else {
            const existingMember = allTeamMembers.get(member._id);
            existingMember.projects += 1;
          }
        });
      });

      const uniqueTeamMembers = Array.from(allTeamMembers.values());

      // Fetch online users to update online status
      const onlineResponse = await fetch('/api/users/online', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (onlineResponse.ok) {
        const onlineUsers = await onlineResponse.json();
        // Update team members with online status
        const updatedTeamMembers = uniqueTeamMembers.map(member => ({
          ...member,
          isOnline: onlineUsers.some((online: any) => online.userId === member._id)
        }));
        setTeamMembers(updatedTeamMembers);
      } else {
        setTeamMembers(uniqueTeamMembers);
      }

    } catch (error: any) {
      console.error('Error fetching team data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const onlineCount = teamMembers.filter(member => member.isOnline).length;
  const adminCount = teamMembers.filter(member => member.role === 'admin').length;
  const totalProjects = teamMembers.reduce((acc, member) => acc + (member.projects || 0), 0);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings fontSize="small" />;
      case 'member': return <Engineering fontSize="small" />;
      case 'viewer': return <Visibility fontSize="small" />;
      default: return <Engineering fontSize="small" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'member': return 'secondary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading team data: {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Groups sx={{ verticalAlign: 'middle', mr: 2, fontSize: 32 }} />
            Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team members, roles, and collaboration
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setInviteDialogOpen(true)}
          size="large"
        >
          Invite Team Members
        </Button>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4, 
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'wrap'
      }}>
        <Card sx={{ flex: 1, minWidth: { xs: 'auto', sm: 200 } }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Team Members
            </Typography>
            <Typography variant="h4" component="div">
              {teamMembers.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Wifi color="success" sx={{ fontSize: 16, mr: 1 }} />
              <Typography variant="body2" color="success.main">
                {onlineCount} online
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: 'auto', sm: 200 } }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Team Admins
            </Typography>
            <Typography variant="h4" component="div">
              {adminCount}
            </Typography>
            <AdminPanelSettings color="primary" sx={{ mt: 1 }} />
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: 'auto', sm: 200 } }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active Projects
            </Typography>
            <Typography variant="h4" component="div">
              {totalProjects}
            </Typography>
            <Engineering color="secondary" sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      </Box>

      {/* Team Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Team Overview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AvatarGroup max={6}>
            {teamMembers.map((member) => (
              <Avatar 
                key={member._id}
                alt={member.name}
                sx={{ 
                  border: member.isOnline ? '2px solid' : 'none',
                  borderColor: 'success.main'
                }}
              >
                {member.name.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Team Members
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip 
                icon={<Wifi />} 
                label={`${onlineCount} Online`} 
                size="small" 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<WifiOff />} 
                label={`${teamMembers.length - onlineCount} Offline`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Team Members" />
          <Tab label="Performance Analytics" />
          <Tab label="Team Settings" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <List>
                {teamMembers.map((member) => (
                  <ListItem
                    key={member._id}
                    secondaryAction={
                      <IconButton onClick={(e) => handleMenuOpen(e, member)}>
                        <MoreVert />
                      </IconButton>
                    }
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: member.isOnline ? 'success.main' : 'grey.400',
                          border: member.isOnline ? '2px solid' : 'none',
                          borderColor: 'success.light'
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {member.name}
                          </Typography>
                          <Chip
                            icon={getRoleIcon(member.role)}
                            label={member.role.toUpperCase()}
                            size="small"
                            color={getRoleColor(member.role)}
                            variant="outlined"
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {member.isOnline ? (
                              <Wifi color="success" fontSize="small" />
                            ) : (
                              <WifiOff color="disabled" fontSize="small" />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {member.isOnline ? 'Online' : 'Offline'}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.projects} projects
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {/* Context Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <Edit sx={{ mr: 1 }} />
                  Edit Role {selectedMember ? `for ${selectedMember.name}` : ''}
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                  <Delete sx={{ mr: 1 }} />
                  Remove {selectedMember ? selectedMember.name : 'from Team'}
                </MenuItem>
              </Menu>
            </Box>
          )}
          {tabValue === 1 && (
            <TeamPerformance members={teamMembers} />
          )}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Team Settings
              </Typography>
              <Typography color="text.secondary">
                Configure team permissions, notifications, and collaboration settings.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Invite Member Dialog */}
      <InviteMemberDialog 
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={async (email, role) => {
          // TODO: Implement real invite logic
          console.log('Inviting:', email, 'as', role);
          // Refresh team data after inviting
          await fetchTeamData();
        }}
      />
    </Box>
  );
};

export default TeamManagementSidebar;