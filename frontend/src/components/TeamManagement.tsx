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
import { PersonAdd, PersonRemove, Close, Wifi, WifiOff, RemoveCircleOutline } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiFetch } from '../config/apiFetch';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
  status?: 'online' | 'busy' | 'offline';
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
  const { onlineUsers } = useSocket(); // Use centralized online users
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
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch team');
      }

      const data = await response.json();
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

  // Merge real-time status
  const teamWithStatus = React.useMemo(() => {
    if (!team) return null;

    const getStatus = (userId: string) => {
      const onlineUser = onlineUsers.find(u => u.userId === userId);
      return onlineUser ? (onlineUser.status || 'online') : 'offline';
    };

    return {
      owner: {
        ...team.owner,
        status: getStatus(team.owner._id),
        isOnline: getStatus(team.owner._id) !== 'offline'
      },
      members: team.members.map(member => ({
        ...member,
        status: getStatus(member._id),
        isOnline: getStatus(member._id) !== 'offline'
      }))
    };
  }, [team, onlineUsers]);

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/projects/${projectId}/members`, {
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
      const response = await apiFetch(`/api/projects/${projectId}/members/${memberId}`, {
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
  const filteredMembers = teamWithStatus?.members.filter(member =>
    showOnlyOnline ? member.status !== 'offline' : true
  ) || [];

  // Calculate correct team count
  const teamMembersCount = teamWithStatus ? 1 + teamWithStatus.members.filter(member => member._id !== teamWithStatus.owner._id).length : 0;

  // FIXED: Only count users with status === 'online'
  const onlineCount = teamWithStatus ?
    (teamWithStatus.owner.status === 'online' ? 1 : 0) + teamWithStatus.members.filter(member => member._id !== teamWithStatus.owner._id && member.status === 'online').length
    : 0;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online': return <Wifi />;
      case 'busy': return <RemoveCircleOutline />;
      case 'offline': return <WifiOff />;
      default: return <WifiOff />;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

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

        {teamWithStatus && (
          <List>
            {/* Project Owner */}
            {(!showOnlyOnline || teamWithStatus.owner.status !== 'offline') && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {teamWithStatus.owner.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {teamWithStatus.owner.name}
                      <Chip label="Owner" size="small" color="primary" />
                      <Chip
                        label={getStatusLabel(teamWithStatus.owner.status)}
                        size="small"
                        color={getStatusColor(teamWithStatus.owner.status) as any}
                        variant="outlined"
                        icon={getStatusIcon(teamWithStatus.owner.status)}
                      />
                    </Box>
                  }
                  secondary={teamWithStatus.owner.email}
                />
              </ListItem>
            )}

            {/* Team Members */}
            {filteredMembers
              .filter(member => member._id !== teamWithStatus.owner._id)
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
                          label={getStatusLabel(member.status)}
                          size="small"
                          color={getStatusColor(member.status) as any}
                          variant="outlined"
                          icon={getStatusIcon(member.status)}
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

            {filteredMembers.filter(member => member._id !== teamWithStatus.owner._id).length === 0 && (
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