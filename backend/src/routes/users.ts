// src/routes/users.ts
import express from 'express';
import { protect } from '../middleware/auth';
import Project from '../models/Project';

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

export default router;
