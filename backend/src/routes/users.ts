// src/routes/users.ts
import express from 'express';
import { protect } from '../middleware/auth';
import Project from '../models/Project';
import User from '../models/User';
import Task from '../models/Task';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/users/online - returns online users across projects the current user can access
router.get('/online', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const projectUsers: Map<string, Map<string, any>> = req.app.get('projectUsers');

    // Find projects user has access to
    const userProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }, '_id');
    const projectIds = userProjects.map(p => p._id.toString());

    const resultUsersMap = new Map<string, any>();

    for (const pid of projectIds) {
      if (projectUsers.has(pid)) {
        const users = projectUsers.get(pid)!;
        for (const user of users.values()) {
          // Use userId as dedup key
          if (!resultUsersMap.has(user.userId)) {
            resultUsersMap.set(user.userId, { userId: user.userId, name: user.name, email: user.email, projectId: pid });
          }
        }
      }
    }

    const final = Array.from(resultUsersMap.values());
    return res.json(final);
  } catch (error: any) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar, theme } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (theme) updateData.theme = theme;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// PUT /api/users/password - Change password
router.put('/password', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// PUT /api/users/notifications - Update notification preferences
router.put('/notifications', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { notificationPreferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// GET /api/users/export - Export user data
router.get('/export', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const user = await User.findById(userId).select('-password');

    // Get user's projects
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }]
    }).populate('owner', 'name email').populate('members', 'name email');

    // Get user's tasks
    const tasks = await Task.find({ assignee: userId })
      .populate('project', 'name')
      .populate('assignee', 'name email');

    const exportData = {
      user,
      projects,
      tasks,
      exportedAt: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error: any) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// DELETE /api/users/account - Delete user account
router.delete('/account', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user's owned projects
    await Project.deleteMany({ owner: userId });

    // Remove user from member lists in other projects
    await Project.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete user's tasks
    await Task.deleteMany({ assignee: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

export default router;
