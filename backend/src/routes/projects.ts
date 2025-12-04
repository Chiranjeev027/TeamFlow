// src/routes/projects.ts
import express from 'express';
import Project, { IProjectPopulated } from '../models/Project';
import Task from '../models/Task';
import { computeAnalyticsFromTasks } from '../utils/analytics';
import mongoose from 'mongoose';
import { protect } from '../middleware/auth';
import User from '../models/User';
import { Activity } from '../models/Activity';

const router = express.Router();

// Get all projects for the user
router.get('/', protect, async (req: any, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id
    }).populate('owner', 'name email').populate('members', 'name email');

    // Transform projects to avoid showing owner in members array
    const transformedProjects = projects.map((project: any) => {
      const projectObj = project.toObject();
      // Filter out owner from members array
      projectObj.members = projectObj.members.filter(
        (member: any) => member._id.toString() !== projectObj.owner._id.toString()
      );
      return projectObj;
    });

    res.json(transformedProjects);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});



// Create a new project
router.post('/', protect, async (req: any, res) => {
  try {
    const { name, description } = req.body;

    const project = new Project({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id]
    });

    await project.save();
    await project.populate('owner', 'name email');

    // Create activity log
    await Activity.create({
      type: 'project_created',
      description: `created project "${project.name}"`,
      user: {
        name: req.user.name,
        _id: req.user._id
      },
      project: {
        name: project.name,
        _id: project._id
      }
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update project
router.put('/:id', protect, async (req: any, res) => {
  try {
    const { name, description } = req.body;
    const projectId = req.params.id;

    console.log('Attempting to update project:', projectId);

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is project owner
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ error: 'Only project owner can update the project' });
    }

    // Update project fields
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    // Emit socket event to notify users
    const io = req.app.get('io');
    if (io) {
      io.to(projectId).emit('project-updated', {
        projectId,
        name: project.name,
        description: project.description
      });
    }

    console.log('Project updated successfully:', projectId);

    // Create activity log
    await Activity.create({
      type: 'project_updated',
      description: `updated project "${project.name}"`,
      user: {
        name: req.user.name,
        _id: req.user._id
      },
      project: {
        name: project.name,
        _id: project._id
      }
    });

    res.json(project);
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});


// Get project by ID with tasks
router.get('/:id', protect, async (req: any, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access
    const isMember = project.members.some((member: any) =>
      member._id.toString() === req.user.id
    );

    if (!isMember && project.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ project, tasks });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Add member to project
router.post('/:projectId/members', protect, async (req: any, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    console.log('Adding member to project:', projectId, 'Email:', email);

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only project owner can add members' });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add user to project members
    project.members.push(userToAdd._id);
    await project.save();

    // Populate and return updated project
    await project.populate('members', 'name email');
    await project.populate('owner', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(projectId).emit('member-added', {
      projectId,
      member: userToAdd
    });

    console.log('Member added successfully:', userToAdd.name);
    res.json(project);
  } catch (error: any) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Remove member from project
router.delete('/:projectId/members/:memberId', protect, async (req: any, res) => {
  try {
    const { projectId, memberId } = req.params;

    console.log('Removing member:', memberId, 'from project:', projectId);

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only project owner can remove members' });
    }

    // Remove member from project
    project.members = project.members.filter(member => member.toString() !== memberId);
    await project.save();

    // Populate and return updated project
    await project.populate('members', 'name email');
    await project.populate('owner', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    io.to(projectId).emit('member-removed', {
      projectId,
      memberId
    });

    console.log('Member removed successfully');
    res.json(project);
  } catch (error: any) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete project
router.delete('/:id', protect, async (req: any, res) => {
  try {
    const projectId = req.params.id;

    console.log('Attempting to delete project:', projectId);

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is project owner
    console.log('Delete Project Debug:');
    console.log('Project Owner:', project.owner);
    console.log('Project Owner Type:', typeof project.owner);
    console.log('Req User ID:', req.user._id);
    console.log('Req User ID Type:', typeof req.user._id);

    const isOwner = project.owner.toString() === req.user._id.toString();
    console.log('Is Owner:', isOwner);

    if (!isOwner) {
      return res.status(403).json({ error: 'Only project owner can delete the project' });
    }

    // Delete all tasks associated with this project
    const deletedTasks = await Task.deleteMany({ project: projectId });
    console.log(`Deleted ${deletedTasks.deletedCount} tasks associated with project ${projectId}`);

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    // Create activity log
    await Activity.create({
      type: 'project_deleted',
      description: `deleted project "${project.name}"`,
      user: {
        name: req.user.name,
        _id: req.user._id
      },
      project: {
        name: project.name,
        _id: project._id
      }
    });

    // Emit socket event to notify users
    const io = req.app.get('io');
    if (io) {
      io.to(projectId).emit('project-deleted', {
        projectId
      });
    }

    console.log('Project deleted successfully:', projectId);
    res.json({
      message: 'Project and associated tasks deleted successfully',
      deletedTasksCount: deletedTasks.deletedCount
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get project members - FIXED with proper typing
router.get('/:projectId/members', protect, async (req: any, res) => {
  try {
    console.log('Fetching members for project:', req.params.projectId);

    const project = await Project.findById(req.params.projectId)
      .populate('members', 'name email isOnline lastSeen')
      .populate('owner', 'name email isOnline lastSeen');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Use type assertion to IProjectPopulated to fix TypeScript error
    const populatedProject = project as unknown as IProjectPopulated;

    console.log('Found project members:', populatedProject.members.length);
    console.log('Owner online status:', populatedProject.owner.isOnline);

    res.json({
      owner: populatedProject.owner,
      members: populatedProject.members
    });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get project analytics
router.get('/:id/analytics', protect, async (req: any, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Check if user has access
    const isMember = project.members && project.members.some((m: any) => m.toString() === req.user.id);
    const isOwner = project.owner && project.owner.toString() === req.user.id;
    if (!isMember && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const now = new Date();

    const agg = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(project._id) } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          todoTasks: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          highPriorityTasks: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          overdueTasks: { $sum: { $cond: [{ $and: [{ $gt: ['$dueDate', null] }, { $lt: ['$dueDate', now] }, { $ne: ['$status', 'done'] }] }, 1, 0] } }
        }
      }
    ]);

    if (agg && agg.length > 0) {
      const stats = agg[0];
      const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
      const analytics = {
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        inProgressTasks: stats.inProgressTasks,
        todoTasks: stats.todoTasks,
        highPriorityTasks: stats.highPriorityTasks,
        overdueTasks: stats.overdueTasks,
        completionRate
      };
      return res.json(analytics);
    }

    // Fallback: compute analytics from raw task docs
    const tasks = await Task.find({ project: project._id });
    const fallbackAnalytics = computeAnalyticsFromTasks(tasks as any[]);
    return res.json(fallbackAnalytics);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// export default router removed from here to add it at the end of the file

// Batch analytics for multiple projects
// POST /api/projects/analytics/batch
router.post('/analytics/batch', protect, async (req: any, res) => {
  try {
    const { projectIds } = req.body;
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: 'projectIds must be a non-empty array' });
    }

    const objectIds = projectIds.map((id: string) => new mongoose.Types.ObjectId(id));
    const now = new Date();

    // Ensure current user has access to the requested projects
    const allowedProjects = await Project.find({ _id: { $in: objectIds }, $or: [{ owner: req.user.id }, { members: req.user.id }] }, '_id');
    const allowedIdsSet = new Set(allowedProjects.map(p => p._id.toString()));

    const allowedObjectIds = allowedProjects.map(p => p._id);

    const agg = await Task.aggregate([
      { $match: { project: { $in: allowedObjectIds } } },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          todoTasks: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          highPriorityTasks: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          overdueTasks: { $sum: { $cond: [{ $and: [{ $gt: ['$dueDate', null] }, { $lt: ['$dueDate', now] }, { $ne: ['$status', 'done'] }] }, 1, 0] } }
        }
      }
    ]);

    // Build map of projectId => stats
    const resultsMap: Record<string, any> = {};
    for (const item of agg) {
      const total = item.totalTasks || 0;
      const completed = item.completedTasks || 0;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      resultsMap[item._id.toString()] = {
        totalTasks: item.totalTasks || 0,
        completedTasks: item.completedTasks || 0,
        inProgressTasks: item.inProgressTasks || 0,
        todoTasks: item.todoTasks || 0,
        highPriorityTasks: item.highPriorityTasks || 0,
        overdueTasks: item.overdueTasks || 0,
        completionRate
      };
    }

    // Ensure all requested projectIds exist with zeros if no tasks or not allowed
    for (const pid of projectIds) {
      if (!resultsMap[pid]) {
        resultsMap[pid] = {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0,
          highPriorityTasks: 0,
          overdueTasks: 0,
          completionRate: 0
        };
      }
    }

    res.json(resultsMap);
  } catch (error: any) {
    console.error('Error in batch analytics:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

export default router;
