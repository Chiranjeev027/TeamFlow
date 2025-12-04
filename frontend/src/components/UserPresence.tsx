// teamflow/frontend/src/components/UserPresence.tsx
import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  socketId: string;
}

const UserPresence: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (socket && user && projectId) {
      console.log('🔌 Joining project room:', projectId, 'User:', user.name);

      // Join project room and notify others
      socket.emit('user-joined', {
        projectId,
        user: {
          userId: user.id,
          name: user.name,
          email: user.email
        }
      });

      // Listen for user presence updates
      socket.on('online-users', (users: OnlineUser[]) => {
        console.log('👥 Online users received:', users);
        setOnlineUsers(users);
      });

      socket.on('user-joined', (userData: OnlineUser) => {
        console.log('✅ User joined:', userData.name);
        setOnlineUsers(prev => {
          const exists = prev.find(u => u.userId === userData.userId);
          return exists ? prev : [...prev, userData];
        });
      });

      socket.on('user-left', (userId: string) => {
        console.log('❌ User left:', userId);
        setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
      });

      // Handle connection errors
      socket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
      });
    }

    return () => {
      if (socket && user) {
        console.log('🚪 Leaving project room:', projectId);
        socket.emit('user-left', { projectId, userId: user.id });
        socket.off('online-users');
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('connect_error');
      }
    };
  }, [socket, projectId, user]);

  // Debug: Log current online users
  useEffect(() => {
    console.log('📊 Current online users:', onlineUsers);
  }, [onlineUsers]);

  return (
    <div className="flex items-center gap-3 mb-4 p-3 card border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <FiUsers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Online now:
        </span>
      </div>
      <div className="flex -space-x-2">
        {onlineUsers.map((onlineUser) => (
          <div
            key={onlineUser.userId}
            title={onlineUser.name}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white dark:border-gray-800 ${onlineUser.userId === user?.id
                ? 'bg-primary-500 ring-2 ring-primary-300'
                : 'bg-secondary-500'
              }`}
          >
            {onlineUser.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
        {onlineUsers.length} online
      </span>
    </div>
  );
};

export default UserPresence;