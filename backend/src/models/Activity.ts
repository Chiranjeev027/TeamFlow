import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['project_created', 'project_updated', 'project_deleted', 'task_created', 'task_updated', 'task_completed', 'member_invited']
    },
    description: {
        type: String,
        required: true
    },
    user: {
        name: { type: String, required: true },
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    project: {
        name: { type: String },
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Activity = mongoose.model('Activity', activitySchema);
