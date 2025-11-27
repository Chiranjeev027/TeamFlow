// src/routes/projects.ts
import express from 'express';
import Project, { IProjectPopulated } from '../models/Project';
import Task from '../models/Task';
import { protect } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get all projects for the user
router.get('/', protect, async (req: any, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id }
      ]
    }).populate('owner', 'name email').populate('members', 'name email');
    
    res.json(projects);
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
    
    res.status(201).json(project);
  } catch (error: any) {
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

export default router;