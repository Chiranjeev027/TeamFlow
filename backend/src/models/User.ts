import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  status: 'online' | 'busy' | 'offline';
  lastSeen: Date;
  theme?: 'light' | 'dark' | 'system';
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectInvites: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  isOnline: { type: Boolean, default: false },
  status: { type: String, enum: ['online', 'busy', 'offline'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  notificationPreferences: {
    type: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: true },
      projectInvites: { type: Boolean, default: true }
    },
    default: {
      email: true,
      push: true,
      taskAssigned: true,
      taskCompleted: true,
      projectInvites: true
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for faster queries
userSchema.index({ isOnline: 1, lastSeen: 1 });

export default mongoose.model<IUser>('User', userSchema);