// teamflow/backend/src/models/Project.ts
import mongoose, { Document, Schema } from 'mongoose';

// Base interface without population
export interface IProject extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

// Interface for populated project (when owner and members are populated)
export interface IProjectPopulated extends Omit<IProject, 'owner' | 'members'> {
  owner: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    isOnline?: boolean;
    lastSeen?: Date;
  };
  members: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }>;
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', projectSchema);