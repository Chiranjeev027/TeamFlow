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
  Switch,
  FormControlLabel
} from '@mui/material';
import { PersonAdd, PersonRemove, Email, Close, Wifi, WifiOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

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
  const socket = useSocket();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<{
    owner: TeamMember;
    members: TeamMember[];
  } | null>(null);
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);

  const fetchTeam = async () => {
    try {
      console.log('🔄 Fetching team for project:', projectId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Team response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch team:', errorText);
        throw new Error('Failed to fetch team');
      }
      
      const data = await response.json();
      console.log('✅ Team data received:', data);
      setTeam(data);
    } catch (error: any) {
      console.error('💥 Error fetching team:', error);
      setError(error.message);
    }
  };

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
      console.log('🔄 Inviting member with email:', email);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      
      console.log('📡 Invite member response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json();
        console.error('❌ Failed to invite member:', data);
        throw new Error(data.error);
      }

      const result = await response.json();
      console.log('✅ Member invited successfully:', result);
      
      setEmail('');
      setSuccess('Team member invited successfully!');
      fetchTeam(); // Refresh team list
      onTeamUpdate(); // Notify parent
    } catch (error: any) {
      console.error('💥 Error inviting member:', error);
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
      fetchTeam(); // Refresh team list
      onTeamUpdate(); // Notify parent
    } catch (error: any) {
      setError(error.message);
    }
  };

  const isOwner = team?.owner._id === user?.id;

  // Filter members based on online status
  const filteredMembers = team?.members.filter(member => 
    showOnlyOnline ? member.isOnline : true
  ) || [];

  // Calculate correct team count (owner + actual members, excluding owner from members count)
  const teamMembersCount = team ? 1 + team.members.filter(member => member._id !== team.owner._id).length : 0;
  const onlineCount = team ? 
    1 + team.members.filter(member => member._id !== team.owner._id && member.isOnline).length 
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Team Management</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Invite Member Section */}
        {isOwner && (
          <>
            <Typography variant="h6" gutterBottom>
              Invite Team Members
            </Typography>
            <Box component="form" onSubmit={inviteMember} sx={{ mb: 3 }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="Enter team member's email"
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAdd />}
                  disabled={loading}
                  sx={{ minWidth: '120px' }}
                >
                  Invite
                </Button>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Team members will receive access to this project and can view and manage tasks.
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Team Members Header with Online Toggle */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Team Members ({showOnlyOnline ? onlineCount : teamMembersCount})
            {showOnlyOnline && (
              <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                ({onlineCount} online)
              </Typography>
            )}
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyOnline}
                onChange={(e) => setShowOnlyOnline(e.target.checked)}
                color="primary"
                icon={<WifiOff />}
                checkedIcon={<Wifi />}
              />
            }
            label="Online only"
            labelPlacement="start"
          />
        </Box>

        {team && (
          <List>
            {/* Project Owner - Always show owner */}
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
                      {team.owner.isOnline ? (
                        <Chip 
                          label="Online" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          icon={<Wifi />}
                        />
                      ) : (
                        <Chip 
                          label="Offline" 
                          size="small" 
                          color="default" 
                          variant="outlined"
                          icon={<WifiOff />}
                        />
                      )}
                    </Box>
                  }
                  secondary={team.owner.email}
                />
              </ListItem>
            )}

            {/* Team Members (excluding owner) */}
            {filteredMembers
              .filter(member => member._id !== team.owner._id) // Don't show owner in members list
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
                      {member.isOnline ? (
                        <Chip 
                          label="Online" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          icon={<Wifi />}
                        />
                      ) : (
                        <Chip 
                          label="Offline" 
                          size="small" 
                          color="default" 
                          variant="outlined"
                          icon={<WifiOff />}
                        />
                      )}
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
                  primary={
                    showOnlyOnline 
                      ? "No team members online" 
                      : "No team members yet"
                  }
                  secondary={
                    showOnlyOnline 
                      ? "Other team members are currently offline" 
                      : "Invite team members to collaborate on this project"
                  }
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