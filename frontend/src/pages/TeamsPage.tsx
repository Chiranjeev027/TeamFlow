// teamflow/frontend/src/pages/TeamsPage.tsx
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
  Paper
} from '@mui/material';
import {
  Groups,
  PersonAdd,
  Wifi,
  WifiOff,
  AdminPanelSettings,
  Engineering
} from '@mui/icons-material';
// auth hook not needed here
import TeamMembersList from '../components/TeamMemberList';
import InviteMemberDialog from '../components/InviteMemberDialog';
import TeamPerformance from '../components/TeamPerformance';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  isOnline: boolean;
  lastSeen: string;
  projects: number;
  tasksCompleted: number;
  avatar?: string;
}

const TeamsPage: React.FC = () => {
  // const { user } = useAuth(); // not used here
  const [tabValue, setTabValue] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // TODO: Replace with actual API call
        const mockTeam: TeamMember[] = [
          {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice@company.com',
            role: 'admin',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            projects: 5,
            tasksCompleted: 42
          },
          {
            _id: '2',
            name: 'Bob Smith',
            email: 'bob@company.com',
            role: 'member',
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            projects: 3,
            tasksCompleted: 28
          },
          {
            _id: '3',
            name: 'Carol Davis',
            email: 'carol@company.com',
            role: 'viewer',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            projects: 2,
            tasksCompleted: 15
          }
        ];
        setTeamMembers(mockTeam);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        // no loading state used here
      }
    };

    fetchTeamData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onlineCount = teamMembers.filter(member => member.isOnline).length;
  const adminCount = teamMembers.filter(member => member.role === 'admin').length;

  return (
    <Box sx={{ p: 3 }}>
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
                    {teamMembers.reduce((acc, member) => acc + member.projects, 0)}
                </Typography>
                <Engineering color="secondary" sx={{ mt: 1 }} />
            </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: { xs: 'auto', sm: 200 } }}>
            <CardContent>
                <Typography color="text.secondary" gutterBottom>
                    Tasks Completed
                </Typography>
                <Typography variant="h4" component="div">
                    {teamMembers.reduce((acc, member) => acc + member.tasksCompleted, 0)}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    +12% this week
                </Typography>
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
            <TeamMembersList 
              members={teamMembers} 
              onInviteMember={() => setInviteDialogOpen(true)}
            />
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
              {/* Add team settings form here */}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Invite Member Dialog */}
      <InviteMemberDialog 
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={(email, role) => {
          // TODO: Implement invite logic
          console.log('Inviting:', email, 'as', role);
        }}
      />
    </Box>
  );
};

export default TeamsPage;