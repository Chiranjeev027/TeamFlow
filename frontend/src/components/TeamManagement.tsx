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
import { PersonAdd, PersonRemove, Close, Wifi, WifiOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
// no socket usage in TeamManagement currently

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
  // Not using socket here - removed to prevent unused variable warning
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
      console.log('👑 Team owner:', data.owner);
      console.log('👥 Team members:', data.members);
      console.log('🔑 Current user:', user);
      console.log('❓ Is current user owner?', user?.id === data.owner._id);
      
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

  const isOwner = team?.owner?._id?.toString() === user?.id?.toString();
  console.log('🔍 TeamManagement - Ownership Check:', {
    teamOwnerId: team?.owner._id,
    currentUserId: user?.id,
    isOwner: isOwner
  });

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

        {/* Debug info - show only in development */}
        {import.meta.env.DEV && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Debug Info:</strong> You are {isOwner ? 'the owner' : 'a member'}. 
              Owner: {team?.owner.name} (ID: {team?.owner._id})
            </Typography>
          </Alert>
        )}

        {/* Invite Member Section - ONLY show if owner */}
        {isOwner && (
          <>
            <Typography variant="h6" gutterBottom color="primary">
              ✨ Invite Team Members
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Invite team members by email. They'll get access to this entire project and all tasks.
              </Typography>
            </Alert>
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
                  helperText="User must have a TeamFlow account"
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAdd />}
                  disabled={loading}
                  sx={{ minWidth: '120px', mt: 1 }}
                  color="primary"
                >
                  {loading ? 'Inviting...' : 'Invite'}
                </Button>
              </Box>
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
                      : isOwner 
                        ? "Invite team members to collaborate on this project" 
                        : "Only the project owner can invite team members"
                  }
                />
              </ListItem>
            )}
          </List>
        )}

        {/* Help Section */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            💡 How Team Collaboration Works:
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            • <strong>Project owner</strong> can invite team members by email<br/>
            • <strong>Team members</strong> get access to all tasks in the project<br/>
            • <strong>Assign tasks</strong> to specific members using the assignee dropdown<br/>
            • <strong>Real-time updates</strong> - everyone sees changes instantly<br/>
            • <strong>Online presence</strong> - see who's currently viewing the project
          </Typography>
          {!isOwner && (
            <Typography variant="caption" color="textSecondary">
              Only the project owner can invite new team members.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamManagement;