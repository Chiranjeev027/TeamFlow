import express from 'express';
import { Activity } from '../models/Activity';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get recent activities
// router.get('/', protect, async (req, res) => {
//     try {
//         const activities = await Activity.find()
//             .sort({ createdAt: -1 })
//             .limit(20);
//         res.json(activities);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch activities' });
//     }
// });
// Get recent activities for a specific user
router.get('/:id', protect, async (req, res) => {
    try {
        const activities = await Activity.find({ 'user._id': req.params.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

export default router;
