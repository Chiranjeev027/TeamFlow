// teamflow/frontend/src/components/UserPresence.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, AvatarGroup, Chip, Tooltip } from '@mui/material';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  socketId: string;
}

const UserPresence: React.FC<{ projectId: string }> = ({ projectId }) => {
  const socket = useSocket();
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
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      mb: 3,
      p: 2,
      backgroundColor: 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 1
    }}>
      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
        Online now:
      </Typography>
      <AvatarGroup max={6} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem' } }}>
        {onlineUsers.map((onlineUser) => (
          <Tooltip key={onlineUser.userId} title={onlineUser.name}>
            <Avatar 
              sx={{ 
                bgcolor: onlineUser.userId === user?.id ? 'primary.main' : 'secondary.main',
                border: onlineUser.userId === user?.id ? '2px solid' : 'none',
                borderColor: 'primary.main'
              }}
            >
              {onlineUser.name.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
      
      {/* Show meaningful status messages */}
      {onlineUsers.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No one online
        </Typography>
      )}
      {onlineUsers.length === 1 && (
        <Typography variant="body2" color="text.secondary">
          You're the only one here
        </Typography>
      )}
      {onlineUsers.length > 1 && (
        <Chip 
          label={`${onlineUsers.length} online`} 
          size="small" 
          color="primary"
          variant="outlined"
        />
      )}
      
      {/* Debug info */}
      {import.meta.env.DEV && (
        <Chip 
          label={`Socket: ${socket?.connected ? 'Connected' : 'Disconnected'}`}
          size="small"
          color={socket?.connected ? 'success' : 'error'}
          variant="outlined"
        />
      )}
    </Box>
  );
};

export default UserPresence;