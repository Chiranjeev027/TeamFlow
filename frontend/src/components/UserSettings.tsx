// teamflow/frontend/src/components/UserSettings.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { FiLock, FiUser, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        {user?.name}'s Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage your account settings and preferences
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex justify-between items-center">
          {error}
          <button onClick={() => setError('')} className="text-red-700 dark:text-red-300">×</button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex justify-between items-center">
          {success}
          <button onClick={() => setSuccess('')} className="text-green-700 dark:text-green-300">×</button>
        </div>
      )}

      {/* Profile Section */}
      <div className="card mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FiUser className="text-primary-500 w-5 h-5" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiEdit2 className="w-5 h-5 text-primary-500" />
            </button>
          ) : (
            <button onClick={() => setEditMode(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        {editMode && (
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditMode(false)} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center gap-2">
                <FiSave className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password Section */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <FiLock className="text-primary-500 w-5 h-5" />
          <h2 className="text-xl font-semibold">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiLock className="w-4 h-4" />
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-red-500 dark:border-red-700 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FiTrash2 className="text-red-500 w-5 h-5" />
          <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Once you delete your account, there is no going back. Please be certain.
        </p>

        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
        >
          <FiTrash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

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
    </div>
  );
};

export default UserSettings;
