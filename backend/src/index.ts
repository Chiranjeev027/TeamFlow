// teamflow/backend/src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { securityMiddleware } from './middleware/security';
import { apiLimiter } from './middleware/rateLimit';
import { requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import usersRoutes from './routes/users';
import teamEventRoutes from './routes/teamEventRoutes';
import activityRoutes from './routes/activities';
import { setupGlobalHandlers } from './socket/handlers';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(securityMiddleware);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(requestLogger);
app.use(apiLimiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/team-events', teamEventRoutes);
app.use('/api/activities', activityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    message: 'Server is running!',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Define interface for online users
interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  socketId: string;
  joinedAt?: string;
}

// Socket.io - Store online users by project
const projectUsers = new Map<string, Map<string, OnlineUser>>();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Setup global event handlers (online status, task presence, etc.)
  setupGlobalHandlers(io, socket);

  // User joins a project - FIXED VERSION
  socket.on('user-joined', ({ projectId, user }: { projectId: string; user: OnlineUser }) => {
    if (!projectId || !user) {
      console.error('❌ Invalid user-joined data:', { projectId, user });
      return;
    }

    console.log(`👤 ${user.name} joined project ${projectId}`);

    socket.join(projectId);

    // Initialize project users map if not exists
    if (!projectUsers.has(projectId)) {
      projectUsers.set(projectId, new Map());
    }

    const users = projectUsers.get(projectId)!;

    // Remove user if they already exist (prevent duplicates)
    for (const [existingSocketId, existingUser] of users.entries()) {
      if (existingUser.userId === user.userId) {
        users.delete(existingSocketId);
        break;
      }
    }

    // Add user with current socket ID
    users.set(socket.id, {
      ...user,
      socketId: socket.id,
      joinedAt: new Date().toISOString()
    });

    // Get all online users for this project
    const onlineUsers = Array.from(users.values());
    console.log(`📊 Online users in ${projectId}:`, onlineUsers.map((u: OnlineUser) => u.name));

    // Notify everyone in the project
    io.to(projectId).emit('online-users', onlineUsers);
  });

  // User leaves a project - FIXED VERSION
  socket.on('user-left', ({ projectId, userId }: { projectId: string; userId: string }) => {
    if (!projectId || !userId) {
      console.error('❌ Invalid user-left data:', { projectId, userId });
      return;
    }

    console.log(`👤 User ${userId} left project ${projectId}`);

    socket.leave(projectId);

    if (projectUsers.has(projectId)) {
      const users = projectUsers.get(projectId)!;
      let removedUser = null;

      // Find and remove the user
      for (const [socketId, user] of users.entries()) {
        if (user.userId === userId) {
          removedUser = user;
          users.delete(socketId);
          break;
        }
      }

      if (removedUser) {
        // Notify others
        const onlineUsers = Array.from(users.values());
        io.to(projectId).emit('online-users', onlineUsers);
        console.log(`📊 Updated online users in ${projectId}:`, onlineUsers.map((u: OnlineUser) => u.name));
      }
    }
  });

  // Handle disconnect - FIXED VERSION
  socket.on('disconnect', (reason) => {
    console.log('🔌 User disconnected:', socket.id, 'Reason:', reason);

    // Remove user from all projects
    projectUsers.forEach((users, projectId) => {
      if (users.has(socket.id)) {
        const user = users.get(socket.id)!;
        users.delete(socket.id);

        // Notify others only if there are still users to notify
        if (users.size > 0) {
          const onlineUsers = Array.from(users.values());
          io.to(projectId).emit('online-users', onlineUsers);
        }

        console.log(`🗑️ Removed ${user.name} from project ${projectId}`);
      }
    });
  });

  // Project joining for task updates
  socket.on('join-project', (projectId: string) => {
    socket.join(projectId);
    console.log(`📁 User ${socket.id} joined project ${projectId}`);
  });

  socket.on('leave-project', (projectId: string) => {
    socket.leave(projectId);
    console.log(`📁 User ${socket.id} left project ${projectId}`);
  });

  // Typing indicators
  socket.on('user-typing', ({ projectId, taskId, userId, userName }: { projectId: string; taskId?: string; userId: string; userName: string }) => {
    socket.to(projectId).emit('user-typing', {
      userId,
      userName,
      taskId,
      isTyping: true
    });
  });

  socket.on('user-stop-typing', ({ projectId, userId }: { projectId: string; userId: string }) => {
    socket.to(projectId).emit('user-stop-typing', { userId });
  });

  // Task movement tracking
  socket.on('task-moved', ({ projectId, taskId, fromStatus, toStatus, movedBy }: { projectId: string; taskId: string; fromStatus: string; toStatus: string; movedBy: string }) => {
    const activity = {
      type: 'task_moved',
      taskId,
      fromStatus,
      toStatus,
      movedBy,
      timestamp: new Date().toISOString()
    };
    io.to(projectId).emit('task-activity', activity);
  });

  // Add error handling
  socket.on('error', (error) => {
    console.error('🔌 Socket error:', error);
  });
});

app.set('io', io);
// Expose projectUsers map to express app for routes to access
app.set('projectUsers', projectUsers);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Detailed health check
app.get('/api/health/detailed', async (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  let dbPing: any = 'Disconnected';
  if (mongoose.connection && mongoose.connection.db) {
    try {
      dbPing = await mongoose.connection.db.admin().ping();
    } catch (err: any) {
      dbPing = { error: String(err.message || err) };
    }
  }

  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbState,
    databaseStats: dbPing
  };
  res.json(health);
});