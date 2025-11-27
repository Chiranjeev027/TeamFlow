// teamflow/backend/src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import User from './models/User';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with detailed error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB Atlas...');
console.log('📡 Connection URL:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide password in logs

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('🗄️ Database: teamflow');
})
.catch(err => {
  console.error('❌ MongoDB connection failed:');
  console.error('   Error:', err.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('   1. Check if your MongoDB Atlas cluster is running');
  console.log('   2. Verify your username and password in the connection string');
  console.log('   3. Make sure your IP is whitelisted in MongoDB Atlas');
  console.log('   4. Check if "teamflow" database exists');
  console.log('\n🔗 Go to: https://cloud.mongodb.com to check your cluster');
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health check with DB status
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    message: 'Server is running!',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Test database connection (Fixed TypeScript error)
app.get('/api/test-db', async (req, res) => {
  try {
    // Check if connection is ready and db is available
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        message: 'Database not connected',
        status: mongoose.connection.readyState
      });
    }

    // Safe way to check database connection
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ 
        message: 'Database instance not available'
      });
    }

    const adminDb = db.admin();
    const result = await adminDb.ping();
    
    res.json({ 
      message: 'Database connection successful!',
      ping: result,
      database: mongoose.connection.name
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Simple database test without admin access
app.get('/api/db-simple-test', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusText = 
      dbStatus === 0 ? 'Disconnected' :
      dbStatus === 1 ? 'Connected' :
      dbStatus === 2 ? 'Connecting' :
      dbStatus === 3 ? 'Disconnecting' : 'Unknown';
    
    res.json({
      message: 'Database status check',
      status: statusText,
      readyState: dbStatus,
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Database check failed',
      error: error.message
    });
  }
});

// Socket.io
// Store online users by project
const projectUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins a project
  socket.on('user-joined', ({ projectId, user }) => {
    socket.join(projectId);
    
    // Add user to project's online users
    if (!projectUsers.has(projectId)) {
      projectUsers.set(projectId, new Map());
    }
    const users = projectUsers.get(projectId);
    users.set(socket.id, { ...user, socketId: socket.id });
    
    // Get all online users for this project
    const onlineUsers = Array.from(users.values());
    
    // Notify everyone in the project
    io.to(projectId).emit('online-users', onlineUsers);
    console.log(`👥 User ${user.name} joined project ${projectId}`);
  });

  // User leaves a project
  socket.on('user-left', ({ projectId, userId }) => {
    socket.leave(projectId);
    
    // Remove user from project's online users
    if (projectUsers.has(projectId)) {
      const users = projectUsers.get(projectId);
      users.delete(socket.id);
      
      // Notify others
      const onlineUsers = Array.from(users.values());
      io.to(projectId).emit('online-users', onlineUsers);
      io.to(projectId).emit('user-left', userId);
    }
    
    console.log(`👥 User left project ${projectId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    
    // Remove user from all projects
    projectUsers.forEach((users, projectId) => {
      if (users.has(socket.id)) {
        const user = users.get(socket.id);
        users.delete(socket.id);
        
        // Notify others
        const onlineUsers = Array.from(users.values());
        io.to(projectId).emit('online-users', onlineUsers);
        io.to(projectId).emit('user-left', user.userId);
      }
    });
  });

  // project joining for task updates
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(projectId);
    console.log(`User ${socket.id} left project ${projectId}`);
  });
  
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ DB test: http://localhost:${PORT}/api/db-simple-test`);
});