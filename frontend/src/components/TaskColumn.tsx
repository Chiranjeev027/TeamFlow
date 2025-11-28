// teamflow/frontend/src/components/TaskColumn.tsx
import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import TaskCard from './TaskCard';
import type { Task } from '../types';

interface TaskColumnProps {
  title: string;
  color: string;
  tasks: Task[];
  status: 'todo' | 'in-progress' | 'done';
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: 'todo' | 'in-progress' | 'done') => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  color,
  tasks,
  status,
  onEditTask,
  onDeleteTask,
  onDragOver,
  onDrop,
  onDragStart
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        minHeight: '100%',
        backgroundColor: 'background.paper', // CHANGED: Use theme paper color
        border: '1px solid',
        borderColor: 'divider' // CHANGED: Use theme divider color
      }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: color,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: color
          }}
        />
        {title} 
        <Chip 
          label={tasks.length} 
          size="small" 
        />
      </Typography>
      
      {tasks.map((task) => (
        <div
          key={task._id}
          onDragStart={(e) => onDragStart(e, task._id)}
        >
          <TaskCard
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        </div>
      ))}
    </Paper>
  );
};

export default TaskColumn;