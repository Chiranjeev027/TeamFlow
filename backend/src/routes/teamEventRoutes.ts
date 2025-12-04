import express, { Response } from 'express';
import TeamEvent from '../models/TeamEventModel';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types/express';

const router = express.Router();

// Get all team events with optional date range filter
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { start, end } = req.query;

        let query: any = {};

        // Filter by date range if provided
        if (start && end) {
            query = {
                $or: [
                    { startDate: { $gte: new Date(start as string), $lte: new Date(end as string) } },
                    { endDate: { $gte: new Date(start as string), $lte: new Date(end as string) } },
                    {
                        startDate: { $lte: new Date(start as string) },
                        endDate: { $gte: new Date(end as string) }
                    }
                ]
            };
        }

        const events = await TeamEvent.find(query)
            .populate('createdBy', 'name email')
            .populate('attendees', 'name email')
            .populate('project', 'name')
            .sort({ startDate: 1 });

        res.json(events);
    } catch (error: any) {
        console.error('Error fetching team events:', error);
        res.status(500).json({ message: 'Error fetching team events', error: error.message });
    }
});

// Get upcoming events with reminders
router.get('/upcoming', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const events = await TeamEvent.find({
            startDate: { $gte: now, $lte: tomorrow },
            'reminder.enabled': true,
        })
            .populate('createdBy', 'name email')
            .populate('attendees', 'name email')
            .populate('project', 'name')
            .sort({ startDate: 1 });

        res.json(events);
    } catch (error: any) {
        console.error('Error fetching upcoming events:', error);
        res.status(500).json({ message: 'Error fetching upcoming events', error: error.message });
    }
});

// Get single event by ID
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const event = await TeamEvent.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('attendees', 'name email')
            .populate('project', 'name');

        if (!event) {
            res.status(404).json({ message: 'Event not found' });
            return;
        }

        res.json(event);
    } catch (error: any) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event', error: error.message });
    }
});

// Create new team event
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, startDate, endDate, eventType, attendees, project, reminder } = req.body;

        if (!title || !startDate || !endDate) {
            res.status(400).json({ message: 'Title, start date, and end date are required' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const event = new TeamEvent({
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            eventType: eventType || 'other',
            createdBy: req.user._id,
            attendees: attendees || [],
            project,
            reminder: reminder || { enabled: false, minutesBefore: 15 },
        });

        await event.save();

        const populatedEvent = await TeamEvent.findById(event._id)
            .populate('createdBy', 'name email')
            .populate('attendees', 'name email')
            .populate('project', 'name');

        res.status(201).json(populatedEvent);
    } catch (error: any) {
        console.error('Error creating team event:', error);
        res.status(500).json({ message: 'Error creating team event', error: error.message });
    }
});

// Update team event
router.put('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, startDate, endDate, eventType, attendees, project, reminder } = req.body;

        const event = await TeamEvent.findById(req.params.id);

        if (!event) {
            res.status(404).json({ message: 'Event not found' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Only creator can update the event
        if (event.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to update this event' });
            return;
        }

        // Update fields
        if (title) event.title = title;
        if (description !== undefined) event.description = description;
        if (startDate) event.startDate = new Date(startDate);
        if (endDate) event.endDate = new Date(endDate);
        if (eventType) event.eventType = eventType;
        if (attendees) event.attendees = attendees;
        if (project !== undefined) event.project = project;
        if (reminder) event.reminder = reminder;

        await event.save();

        const updatedEvent = await TeamEvent.findById(event._id)
            .populate('createdBy', 'name email')
            .populate('attendees', 'name email')
            .populate('project', 'name');

        res.json(updatedEvent);
    } catch (error: any) {
        console.error('Error updating team event:', error);
        res.status(500).json({ message: 'Error updating team event', error: error.message });
    }
});

// Delete team event
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const event = await TeamEvent.findById(req.params.id);

        if (!event) {
            res.status(404).json({ message: 'Event not found' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Only creator can delete the event
        if (event.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this event' });
            return;
        }

        await TeamEvent.findByIdAndDelete(req.params.id);

        res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting team event:', error);
        res.status(500).json({ message: 'Error deleting team event', error: error.message });
    }
});

export default router;
