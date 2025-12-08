// teamflow/frontend/src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config/api';

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

  // Initialize socket connection once
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    });

    setSocket(newSocket);

    // Listen for global online users updates
    newSocket.on('online-users-update', (users: OnlineUser[]) => {
      console.log('📊 Online users updated:', users);
      setOnlineUsers(users);
    });

    // Listen for task presence updates
    newSocket.on('task-presence-update', (data: { taskId: string; userId: string; userName: string; action: 'joined' | 'left' }) => {
      console.log(`📝 Task presence: ${data.userName} ${data.action} task ${data.taskId}`);
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server with socket id:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Handle user login/re-login
  useEffect(() => {
    if (!socket || !user) return;

    const userId = user._id || user.id;
    if (!userId) {
      console.error('❌ Cannot log in to socket: Missing User ID', user);
      return;
    }

    const handleLogin = () => {
      console.log('🚀 Emitting global-login for:', user.name);
      socket.emit('global-login', {
        userId: userId,
        name: user.name,
        email: user.email
      });
    };

    if (socket.connected) {
      handleLogin();
    }

    // Also listen for reconnects to re-login
    socket.on('connect', handleLogin);

    return () => {
      socket.off('connect', handleLogin);
    };
  }, [socket, user]);

  // Update user status
  const updateStatus = (status: 'online' | 'busy' | 'offline') => {
    if (socket && user) {
      const userId = user._id || user.id;
      if (!userId) {
        console.error('❌ Cannot update status: Missing User ID');
        return;
      }

      console.log(`🔄 Emitting status-change: ${status}`);
      socket.emit('status-change', {
        userId: userId,
        status
      });
    }
  };

  // Join a task (for presence tracking)
  const joinTask = (taskId: string) => {
    if (socket && user) {
      const userId = user._id || user.id;
      socket.emit('join-task', {
        userId: userId,
        taskId
      });
    }
  };

  // Leave a task
  const leaveTask = (taskId: string) => {
    if (socket && user) {
      const userId = user._id || user.id;
      socket.emit('leave-task', {
        userId: userId,
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