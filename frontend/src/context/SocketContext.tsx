// teamflow/frontend/src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  socketId: string;
  status?: 'online' | 'busy' | 'offline';
  currentTask?: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: OnlineUser[];
  updateStatus: (status: 'online' | 'busy' | 'offline') => void;
  joinTask: (taskId: string) => void;
  leaveTask: (taskId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server with socket id:', newSocket.id);

      // Emit global-login when connected and user is authenticated
      if (user) {
        newSocket.emit('global-login', {
          userId: user._id,
          name: user.name,
          email: user.email
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    // Listen for global online users updates
    newSocket.on('online-users-update', (users: OnlineUser[]) => {
      console.log('📊 Online users updated:', users);
      setOnlineUsers(users);
    });

    // Listen for task presence updates
    newSocket.on('task-presence-update', (data: { taskId: string; userId: string; userName: string; action: 'joined' | 'left' }) => {
      console.log(`📝 Task presence: ${data.userName} ${data.action} task ${data.taskId}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Update user status
  const updateStatus = (status: 'online' | 'busy' | 'offline') => {
    if (socket && user) {
      socket.emit('status-change', {
        userId: user._id,
        status
      });
    }
  };

  // Join a task (for presence tracking)
  const joinTask = (taskId: string) => {
    if (socket && user) {
      socket.emit('join-task', {
        userId: user._id,
        taskId
      });
    }
  };

  // Leave a task
  const leaveTask = (taskId: string) => {
    if (socket && user) {
      socket.emit('leave-task', {
        userId: user._id,
        taskId
      });
    }
  };

  const contextValue: SocketContextType = {
    socket,
    onlineUsers,
    updateStatus,
    joinTask,
    leaveTask
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};