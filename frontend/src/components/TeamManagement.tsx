// teamflow/frontend/src/components/TeamManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Chip,
  Box,
  Typography,
  Alert,
  Divider,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { PersonAdd, PersonRemove, Close, Wifi, WifiOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext'; // ADD THIS IMPORT

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface TeamManagementProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onTeamUpdate: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ projectId, open, onClose, onTeamUpdate }) => {
  const { user } = useAuth();
  const socket = useSocket(); // ADD SOCKET HOOK
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<{
    owner: TeamMember;
    members: TeamMember[];
  } | null>(null);
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set()); // ADD ONLINE TRACKING

  const fetchTeam = async () => {
    try {
      console.log('🔄 Fetching team for project:', projectId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch team');
      }
      
      const data = await response.json();
      console.log('✅ Team data received:', data);
      
      // Enhance team data with online status from socket
      const enhancedData = {
        owner: {
          ...data.owner,
          isOnline: onlineUserIds.has(data.owner._id)
        },
        members: data.members.map((member: TeamMember) => ({
          ...member,
          isOnline: onlineUserIds.has(member._id)
        }))
      };
      
      setTeam(enhancedData);
    } catch (error: any) {
      console.error('💥 Error fetching team:', error);
      setError(error.message);
    }
  };

  // Listen for real-time online users updates
  useEffect(() => {
    if (socket && open && projectId) {
      console.log('🔌 TeamManagement: Setting up socket listeners');
      
      const handleOnlineUsers = (users: any[]) => {
        console.log('👥 TeamManagement: Online users update', users);
        const newOnlineIds = new Set(users.map((u: any) => u.userId));
        setOnlineUserIds(newOnlineIds);
        
        // Update team with new online status
        if (team) {
          setTeam({
            owner: {
              ...team.owner,
              isOnline: newOnlineIds.has(team.owner._id)
            },
            members: team.members.map(member => ({
              ...member,
              isOnline: newOnlineIds.has(member._id)
            }))
          });
        }
      };

      socket.on('online-users', handleOnlineUsers);
      
      // Request current online users
      socket.emit('user-joined', {
        projectId,
        user: {
          userId: user?.id,
          name: user?.name,
          email: user?.email
        }
      });

      return () => {
        console.log('🔌 TeamManagement: Cleaning up socket listeners');
        socket.off('online-users', handleOnlineUsers);
      };
    }
  }, [socket, open, projectId, team, user]);

  useEffect(() => {
    if (open && projectId) {
      fetchTeam();
    }
  }, [open, projectId]);

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setEmail('');
      setSuccess('Team member invited successfully!');
      fetchTeam();
      onTeamUpdate();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setSuccess('Team member removed successfully!');
      fetchTeam();
      onTeamUpdate();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const isOwner = team?.owner?._id?.toString() === user?.id?.toString();

  // Filter members based on online status
  const filteredMembers = team?.members.filter(member => 
    showOnlyOnline ? member.isOnline : true
  ) || [];

  // Calculate correct team count
  const teamMembersCount = team ? 1 + team.members.filter(member => member._id !== team.owner._id).length : 0;
  const onlineCount = team ? 
    (team.owner.isOnline ? 1 : 0) + team.members.filter(member => member._id !== team.owner._id && member.isOnline).length 
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">
            {isOwner ? 'Manage Team' : 'View Team'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Debug info */}
        {import.meta.env.DEV && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Debug:</strong> Online users: {onlineUserIds.size} | Socket: {socket?.connected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Alert>
        )}

        {/* Invite Member Section */}
        {isOwner && (
          <>
            <Typography variant="h6" gutterBottom color="primary">
              Invite Team Members
            </Typography>
            <Box component="form" onSubmit={inviteMember} sx={{ mb: 3 }}>
              <Box display="flex" gap={1} alignItems="flex-start">
                <TextField
                  fullWidth
                  label="Team member's email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="teammate@example.com"
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAdd />}
                  disabled={loading}
                  sx={{ minWidth: '120px', mt: 1 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Invite'}
                </Button>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Team Members Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Team Members ({showOnlyOnline ? onlineCount : teamMembersCount})
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyOnline}
                onChange={(e) => setShowOnlyOnline(e.target.checked)}
                color="primary"
              />
            }
            label="Online only"
            labelPlacement="start"
          />
        </Box>

        {team && (
          <List>
            {/* Project Owner */}
            {(!showOnlyOnline || team.owner.isOnline) && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {team.owner.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {team.owner.name}
                      <Chip label="Owner" size="small" color="primary" />
                      <Chip 
                        label={team.owner.isOnline ? "Online" : "Offline"} 
                        size="small" 
                        color={team.owner.isOnline ? "success" : "default"} 
                        variant="outlined"
                        icon={team.owner.isOnline ? <Wifi /> : <WifiOff />}
                      />
                    </Box>
                  }
                  secondary={team.owner.email}
                />
              </ListItem>
            )}

            {/* Team Members */}
            {filteredMembers
              .filter(member => member._id !== team.owner._id)
              .map((member) => (
              <ListItem key={member._id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {member.name}
                      <Chip 
                        label={member.isOnline ? "Online" : "Offline"} 
                        size="small" 
                        color={member.isOnline ? "success" : "default"} 
                        variant="outlined"
                        icon={member.isOnline ? <Wifi /> : <WifiOff />}
                      />
                    </Box>
                  }
                  secondary={member.email}
                />
                {isOwner && (
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => removeMember(member._id)}
                      color="error"
                    >
                      <PersonRemove />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}

            {filteredMembers.filter(member => member._id !== team.owner._id).length === 0 && (
              <ListItem>
                <ListItemText
                  primary={showOnlyOnline ? "No team members online" : "No team members yet"}
                  secondary={showOnlyOnline ? "Other team members are currently offline" : "Invite team members to collaborate"}
                />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamManagement;