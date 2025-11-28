// teamflow/frontend/src/components/TaskCard.tsx
import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Avatar, IconButton } from '@mui/material';
import { Schedule, Edit, Delete } from '@mui/icons-material';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return 'default';
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return 'error';
    if (due < new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)) return 'warning';
    return 'default';
  };

  return (
    <Card
      sx={{ 
        mb: 2, 
        cursor: 'grab',
        borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }}
      draggable
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
            {task.title}
          </Typography>
          <Chip 
            label={task.priority} 
            size="small" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '0.7rem',
              backgroundColor: getPriorityColor(task.priority),
              color: 'white'
            }}
          />
        </Box>
        
        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
            {task.description}
          </Typography>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                fontSize: '0.8rem',
                bgcolor: task.assignee ? 'primary.main' : 'grey.300',
                border: task.assignee?.isOnline ? '2px solid' : 'none',
                borderColor: 'success.main'
              }}
            >
              {task.assignee ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="caption" fontWeight="500">
              {task.assignee?.name || 'Unassigned'}
            </Typography>
          </Box>
        
          <Box display="flex" alignItems="center" gap={1}>
            {task.dueDate && (
              <Chip
                icon={<Schedule fontSize="small" />}
                label={new Date(task.dueDate).toLocaleDateString()}
                size="small"
                variant="outlined"
                color={getDueDateColor(task.dueDate)}
              />
            )}
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDelete(task._id);
                }
              }}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;