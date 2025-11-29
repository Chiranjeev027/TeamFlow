import React, { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useSocket } from '../context/SocketContext';

interface Activity {
  id: string;
  text: string;
  time: string;
}

const ActivityFeed: React.FC<{ projectId: string }> = ({ projectId }) => {
  const socket = useSocket();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!socket) return;

    const pushActivity = (text: string) => {
      setActivities(prev => [{ id: Date.now().toString(), text, time: new Date().toLocaleString() }, ...prev].slice(0, 20));
    };

    const handlers: Record<string, (...args: any[]) => void> = {
      'task-created': (task: any) => pushActivity(`Task '${task.title}' created`),
      'task-updated': (task: any) => pushActivity(`Task '${task.title}' updated`),
      'task-deleted': (_taskId: string) => pushActivity(`A task was deleted`),
      'member-added': (_data: any) => pushActivity(`Member added to the project`),
      'member-removed': (_data: any) => pushActivity(`Member removed from the project`),
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    socket.emit('join-project', projectId);

    return () => {
      Object.keys(handlers).forEach(event => socket.off(event));
      socket.emit('leave-project', projectId);
    };
  }, [socket, projectId]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Recent Activity</Typography>
      <List>
        {activities.map(a => (
          <ListItem key={a.id} disablePadding>
            <ListItemText primary={a.text} secondary={a.time} />
          </ListItem>
        ))}
        {activities.length === 0 && (
          <ListItem>
            <ListItemText primary="No recent activity" />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default ActivityFeed;
