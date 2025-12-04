import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamEvent extends Document {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    eventType: 'meeting' | 'deadline' | 'milestone' | 'other';
    createdBy: mongoose.Types.ObjectId;
    attendees: mongoose.Types.ObjectId[];
    project?: mongoose.Types.ObjectId;
    reminder?: {
        enabled: boolean;
        minutesBefore: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const teamEventSchema = new Schema<ITeamEvent>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        eventType: {
            type: String,
            enum: ['meeting', 'deadline', 'milestone', 'other'],
            default: 'other',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        attendees: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
        },
        reminder: {
            enabled: {
                type: Boolean,
                default: false,
            },
            minutesBefore: {
                type: Number,
                default: 15,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient date range queries
teamEventSchema.index({ startDate: 1, endDate: 1 });
teamEventSchema.index({ createdBy: 1 });
teamEventSchema.index({ attendees: 1 });

export default mongoose.model<ITeamEvent>('TeamEvent', teamEventSchema);
