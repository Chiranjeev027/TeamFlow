// teamflow/frontend/src/components/UserSettings.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import {
  Lock,
  Person,
  DeleteForever,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const UserSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile edit form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      setEditMode(false);
      // You might want to refresh user data here
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      logout();
    } catch (error: any) {
      setError(error.message);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight="700">
        {user?.name}'s Settings
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Manage your account settings and preferences
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Profile Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Person color="primary" />
              <Typography variant="h6" fontWeight="600">
                Profile Information
              </Typography>
            </Box>
            {!editMode ? (
              <IconButton onClick={() => setEditMode(true)} color="primary">
                <Edit />
              </IconButton>
            ) : (
              <IconButton onClick={() => setEditMode(false)}>
                <Cancel />
              </IconButton>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={3} mb={3}>
            <Avatar
              sx={{
                bgcolor: '#10b981',
                width: 80,
                height: 80,
                fontSize: '2rem'
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          {editMode ? (
            <Box component="form" onSubmit={handleProfileUpdate}>
              <TextField
                fullWidth
                label="Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                margin="normal"
                required
              />
              <Box mt={2} display="flex" gap={2} justifyContent="flex-end">
                <Button onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<Save />}>
                  Save Changes
                </Button>
              </Box>
            </Box>
          ) : null}
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Lock color="primary" />
            <Typography variant="h6" fontWeight="600">
              Change Password
            </Typography>
          </Box>

          <Box component="form" onSubmit={handlePasswordChange}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              margin="normal"
              required
            />
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" startIcon={<Lock />}>
                Update Password
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'error.main' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <DeleteForever color="error" />
            <Typography variant="h6" fontWeight="600" color="error">
              Danger Zone
            </Typography>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
            All your projects and data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSettings;
