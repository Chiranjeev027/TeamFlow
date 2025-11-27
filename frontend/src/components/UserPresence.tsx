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
      socket.on('user-joined', (userData: OnlineUser) => {
        setOnlineUsers(prev => {
          const exists = prev.find(u => u.userId === userData.userId);
          return exists ? prev : [...prev, userData];
        });
      });

      socket.on('user-left', (userId: string) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
      });

      socket.on('online-users', (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      if (socket && user) {
        socket.emit('user-left', { projectId, userId: user.id });
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('online-users');
      }
    };
  }, [socket, projectId, user]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      mb: 3,
      p: 2,
      backgroundColor: 'grey.50',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'grey.200'
    }}>
      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
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
      {onlineUsers.length === 1 && (
        <Typography variant="body2" color="textSecondary">
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
    </Box>
  );
};

export default UserPresence;