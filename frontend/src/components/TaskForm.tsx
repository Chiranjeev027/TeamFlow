// teamflow/frontend/src/components/TaskForm.tsx
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Avatar
} from '@mui/material';
import type { Task, Project } from '../types';
import TaskComments from './TaskComments';

interface TaskFormProps {
  task?: Task | null;
  project: Project;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formData: {
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    dueDate: string;
  };
  onFormDataChange: (field: string, value: string) => void;
  mode: 'create' | 'edit';
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  project,
  onSubmit,
  onCancel,
  formData,
  onFormDataChange,
  mode
}) => {
  const taskTemplates = [
    { title: 'Bug Report', description: '**Steps to reproduce:**\n1. \n2. \n3. \n\n**Expected behavior:**\n\n**Actual behavior:**' },
    { title: 'Feature Request', description: '**User story:**\nAs a [user], I want to [action] so that [benefit].\n\n**Acceptance criteria:**\n- [ ] \n- [ ]' },
    { title: 'Design Review', description: '**Design link:**\n\n**Feedback:**\n\n**Action items:**' }
  ];

  const applyTemplate = (index: number | '') => {
    if (index === '') return;
    const template = taskTemplates[index as number];
    onFormDataChange('title', template.title);
    onFormDataChange('description', template.description);
  };

  return (
    <Box component="form" onSubmit={onSubmit} p={3}>
      <Typography variant="h5" gutterBottom>
        {mode === 'create' ? 'Create New Task' : 'Edit Task'}
      </Typography>

      {/* Template Selector */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Use Template</InputLabel>
        <Select
          value=""
          label="Use Template"
          onChange={(e) => applyTemplate(Number(e.target.value))}
        >
          <MenuItem value="">No template</MenuItem>
          {taskTemplates.map((t, i) => (
            <MenuItem key={i} value={i}>{t.title}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Task Title"
        value={formData.title}
        onChange={(e) => onFormDataChange('title', e.target.value)}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Description"
        value={formData.description}
        onChange={(e) => onFormDataChange('description', e.target.value)}
        margin="normal"
        multiline
        rows={3}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
          value={formData.status}
          label="Status"
          onChange={(e) => onFormDataChange('status', e.target.value)}
        >
          <MenuItem value="todo">To Do</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="done">Done</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Priority</InputLabel>
        <Select
          value={formData.priority}
          label="Priority"
          onChange={(e) => onFormDataChange('priority', e.target.value)}
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Assign to Team Member</InputLabel>
        <Select
          value={formData.assignee}
          label="Assign to Team Member"
          onChange={(e) => onFormDataChange('assignee', e.target.value)}
        >
          <MenuItem value="">
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: 'grey.400' }}>
                U
              </Avatar>
              <span>Unassigned - Anyone can work on this</span>
            </Box>
          </MenuItem>
          {project.members.map((member) => (
            <MenuItem key={member._id} value={member._id}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                  {member.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1">{member.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {member.email}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={(e) => onFormDataChange('dueDate', e.target.value)}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      {mode === 'edit' && task && (
        <TaskComments taskId={task._id} />
      )}

      <Box mt={3} display="flex" gap={1} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained">
          {mode === 'create' ? 'Create Task' : 'Update Task'}
        </Button>
      </Box>
    </Box>
  );
};

export default TaskForm;

