// teamflow/backend/src/routes/tasks.ts
import express from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import { protect } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get all tasks for the authenticated user (across all projects)
router.get('/', protect, async (req: any, res) => {
    try {
        // Find all projects where user is owner or member
        const projects = await Project.find({
            $or: [
                { owner: req.user.id },
                { members: req.user.id }
            ]
        });

        const projectIds = projects.map(p => p._id);

        // Get all tasks from those projects
        const tasks = await Task.find({ project: { $in: projectIds } })
            .populate('assignee', 'name email')
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

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

// Bulk update tasks
router.put('/bulk/update', protect, async (req: any, res) => {
    try {
        const { taskIds, updates } = req.body;
        const result = await Task.updateMany(
            { _id: { $in: taskIds } },
            { $set: updates }
        );
        // Find updated tasks to populate and emit
        const updatedTasks = await Task.find({ _id: { $in: taskIds } }).populate('assignee', 'name email');
        const io = req.app.get('io');
        updatedTasks.forEach((task: any) => {
            io.to(task.project.toString()).emit('task-updated', task);
        });
        res.json({ message: 'Tasks updated successfully', count: result.modifiedCount ?? 0 });
    } catch (error: any) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Search tasks
router.get('/search', protect, async (req: any, res) => {
    try {
        const { query, projectId, status, priority, assignee } = req.query;
        let searchFilter: any = {};
        if (projectId) searchFilter.project = projectId;
        if (query) {
            searchFilter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        if (status) searchFilter.status = status;
        if (priority) searchFilter.priority = priority;
        if (assignee) searchFilter.assignee = assignee;
        const tasks = await Task.find(searchFilter).populate('assignee', 'name email').populate('project', 'name').sort({ createdAt: -1 }).limit(50);
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

export default router;