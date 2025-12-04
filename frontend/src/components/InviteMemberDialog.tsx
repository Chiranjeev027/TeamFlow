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
  onInvite: (email: string, role: 'admin' | 'member' | 'viewer', projectId: string) => void;
  projects: Array<{ _id: string; name: string }>;
  projectsLoading?: boolean;
}

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onClose,
  onInvite,
  projects = [],
  projectsLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [error, setError] = useState('');

  // Ensure projects is an array
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    if (!/\S+@\S+\.\S/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onInvite(email, role, selectedProjectId);
    setEmail('');
    setRole('member');
    setSelectedProjectId('');
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f1f5f9' : '#0f172a',
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', color: isDarkMode ? '#f1f5f9' : undefined }}>
            <PersonAdd sx={{ mr: 1 }} />
            Invite Team Member
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
            Invite new members to join your team and collaborate on projects.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {projectsLoading ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Loading projects...
            </Alert>
          ) : safeProjects.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You don't have any projects yet. Please create a project from the Dashboard before inviting members.
            </Alert>
          ) : null}

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            placeholder="teammate@company.com"
            required
            disabled={projectsLoading || safeProjects.length === 0}
            InputLabelProps={{
              sx: { color: isDarkMode ? '#cbd5e1' : undefined }
            }}
            sx={{
              '& .MuiInputBase-input': {
                color: isDarkMode ? '#f1f5f9' : undefined,
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: isDarkMode ? '#475569' : undefined,
                },
                '&:hover fieldset': {
                  borderColor: isDarkMode ? '#64748b' : undefined,
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? '#3b82f6' : undefined,
                },
              },
            }}
          />

          <FormControl fullWidth margin="normal" disabled={projectsLoading || safeProjects.length === 0}>
            <InputLabel sx={{ color: isDarkMode ? '#cbd5e1' : undefined }}>Project</InputLabel>
            <Select
              value={selectedProjectId}
              label="Project"
              onChange={(e) => setSelectedProjectId(e.target.value)}
              sx={{
                color: isDarkMode ? '#f1f5f9' : undefined,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#475569' : undefined,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#64748b' : undefined,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#3b82f6' : undefined,
                },
                '& .MuiSvgIcon-root': {
                  color: isDarkMode ? '#cbd5e1' : undefined,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: isDarkMode ? '#1e293b' : undefined,
                  }
                }
              }}
            >
              {safeProjects.map((project) => (
                <MenuItem
                  key={project._id}
                  value={project._id}
                  sx={{
                    color: isDarkMode ? '#f1f5f9' : undefined,
                    '&:hover': {
                      backgroundColor: isDarkMode ? '#334155' : undefined,
                    },
                  }}
                >
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={projectsLoading || safeProjects.length === 0}>
            <InputLabel sx={{ color: isDarkMode ? '#cbd5e1' : undefined }}>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
              sx={{
                color: isDarkMode ? '#f1f5f9' : undefined,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#475569' : undefined,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#64748b' : undefined,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#3b82f6' : undefined,
                },
                '& .MuiSvgIcon-root': {
                  color: isDarkMode ? '#cbd5e1' : undefined,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: isDarkMode ? '#1e293b' : undefined,
                  }
                }
              }}
            >
              <MenuItem
                value="admin"
                sx={{
                  color: isDarkMode ? '#f1f5f9' : undefined,
                  '&:hover': { backgroundColor: isDarkMode ? '#334155' : undefined },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettings color="primary" />
                  <Box>
                    <Typography sx={{ color: isDarkMode ? '#f1f5f9' : undefined }}>Admin</Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
                      Full access to all features
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem
                value="member"
                sx={{
                  color: isDarkMode ? '#f1f5f9' : undefined,
                  '&:hover': { backgroundColor: isDarkMode ? '#334155' : undefined },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Engineering color="secondary" />
                  <Box>
                    <Typography sx={{ color: isDarkMode ? '#f1f5f9' : undefined }}>Member</Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
                      Can create and manage tasks
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem
                value="viewer"
                sx={{
                  color: isDarkMode ? '#f1f5f9' : undefined,
                  '&:hover': { backgroundColor: isDarkMode ? '#334155' : undefined },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility sx={{ color: isDarkMode ? '#94a3b8' : undefined }} />
                  <Box>
                    <Typography sx={{ color: isDarkMode ? '#f1f5f9' : undefined }}>Viewer</Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
                      Read-only access
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: isDarkMode ? '#334155' : 'grey.50',
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ color: isDarkMode ? '#f1f5f9' : undefined }}>
              {getRoleIcon(role)} {role.toUpperCase()} Permissions
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : 'text.secondary' }}>
              {getRoleDescription(role)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: isDarkMode ? '#cbd5e1' : undefined }}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<PersonAdd />}
            disabled={projectsLoading || safeProjects.length === 0}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteMemberDialog;