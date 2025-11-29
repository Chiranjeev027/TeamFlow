import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material';
import {
  PersonAdd,
  AdminPanelSettings,
  Engineering,
  Visibility
} from '@mui/icons-material';

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: 'admin' | 'member' | 'viewer') => void;
}

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onClose,
  onInvite
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onInvite(email, role);
    setEmail('');
    setRole('member');
    onClose();
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Can manage team members, projects, and settings';
      case 'member':
        return 'Can create and manage tasks in assigned projects';
      case 'viewer':
        return 'Can view projects and tasks but cannot make changes';
      default:
        return '';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'member': return <Engineering />;
      case 'viewer': return <Visibility />;
      default: return <Engineering />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <PersonAdd sx={{ verticalAlign: 'middle', mr: 1 }} />
          Invite Team Member
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Invite new members to join your team and collaborate on projects.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            placeholder="teammate@company.com"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
            >
              <MenuItem value="admin">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettings color="primary" />
                  <Box>
                    <Typography>Admin</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full access to all features
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="member">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Engineering color="secondary" />
                  <Box>
                    <Typography>Member</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Can create and manage tasks
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="viewer">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility color="action" />
                  <Box>
                    <Typography>Viewer</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Read-only access
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {getRoleIcon(role)} {role.toUpperCase()} Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getRoleDescription(role)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<PersonAdd />}>
            Send Invitation
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteMemberDialog;