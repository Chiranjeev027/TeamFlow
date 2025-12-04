import React, { useEffect, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

interface Activity {
  id: string;
  text: string;
  time: string;
}

const ActivityFeed: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { socket } = useSocket();
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
    <div className="card p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <FiActivity className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map(a => (
          <div key={a.id} className="border-l-2 border-primary-500 pl-3 py-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">{a.text}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.time}</p>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
