// teamflow/backend/src/routes/tasks.ts
import express from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { protect } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', protect, async (req: any, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Create a task
router.post('/', protect, async (req: any, res) => {
  try {
    const { title, description, project: projectId, status, assignee, priority, dueDate } = req.body;
    
    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.includes(req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || req.user.id,
      dueDate,
      createdBy: req.user.id
    });

    await task.save();
    await task.populate('assignee', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    io.to(projectId).emit('task-created', task);

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update task
router.put('/:id', protect, async (req: any, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify project access
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.includes(req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('assignee', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    io.to(task.project.toString()).emit('task-updated', updatedTask);

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete task
router.delete('/:id', protect, async (req: any, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify project access
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.includes(req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    io.to(task.project.toString()).emit('task-deleted', req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

export default router;