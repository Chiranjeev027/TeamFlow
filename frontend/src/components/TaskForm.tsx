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
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  useTheme
} from '@mui/material';
import { FiX, FiRotateCcw } from 'react-icons/fi';
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const taskTemplates = [
    { title: 'Bug Report', emoji: '🐛', description: '**Steps to reproduce:**\n1. \n2. \n3. \n\n**Expected behavior:**\n\n**Actual behavior:**' },
    { title: 'Feature Request', emoji: '✨', description: '**User story:**\nAs a [user], I want to [action] so that [benefit].\n\n**Acceptance criteria:**\n- [ ] \n- [ ]' },
    { title: 'Design Review', emoji: '🎨', description: '**Design link:**\n\n**Feedback:**\n\n**Action items:**' }
  ];

  const applyTemplate = (index: number | '') => {
    if (index === '') return;
    const template = taskTemplates[index as number];
    onFormDataChange('title', template.title);
    onFormDataChange('description', template.description);
  };

  const handleClear = () => {
    onFormDataChange('title', '');
    onFormDataChange('description', '');
    onFormDataChange('status', 'todo');
    onFormDataChange('priority', 'medium');
    onFormDataChange('assignee', '');
    onFormDataChange('dueDate', '');
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      {/* Header with better spacing */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          px: 3,
          py: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
            {mode === 'create' ? '✨ New Task' : '✏️ Edit Task'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
            {mode === 'create' ? 'Fill in the details below' : 'Update task information'}
          </Typography>
        </Box>
        <Tooltip title="Close">
          <IconButton onClick={onCancel} sx={{ color: 'white' }}>
            <FiX size={20} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 3, py: 3, maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
        {/* Quick Templates */}
        {mode === 'create' && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2.5,
              bgcolor: isDarkMode ? 'rgba(103, 126, 234, 0.08)' : 'rgba(103, 126, 234, 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(103, 126, 234, 0.2)' : 'rgba(103, 126, 234, 0.3)'}`,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              📋 QUICK TEMPLATES
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {taskTemplates.map((t, i) => (
                <Chip
                  key={i}
                  label={`${t.emoji} ${t.title}`}
                  onClick={() => applyTemplate(i)}
                  size="medium"
                  sx={{
                    bgcolor: isDarkMode ? 'rgba(103, 126, 234, 0.15)' : 'rgba(103, 126, 234, 0.2)',
                    color: isDarkMode ? '#a5b4fc' : '#4c51bf',
                    border: `1px solid ${isDarkMode ? 'rgba(103, 126, 234, 0.3)' : 'rgba(103, 126, 234, 0.4)'}`,
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(103, 126, 234, 0.25)' : 'rgba(103, 126, 234, 0.3)',
                      borderColor: '#667eea',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 8px ${isDarkMode ? 'rgba(103, 126, 234, 0.2)' : 'rgba(103, 126, 234, 0.3)'}`
                    },
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* Basic Information Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 3,
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            📝 BASIC INFO
          </Typography>

          <TextField
            fullWidth
            label="Task Title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            required
            placeholder="What needs to be done?"
            size="medium"
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
              },
              '& .MuiOutlinedInput-input': {
                color: isDarkMode ? '#fff' : '#000'
              }
            }}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            multiline
            rows={4}
            placeholder="Add more details..."
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
              },
              '& .MuiOutlinedInput-input': {
                color: isDarkMode ? '#fff' : '#000'
              }
            }}
          />
        </Paper>

        {/* Task Properties Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 3,
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            ⚙️ PROPERTIES
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 2.5 }}>
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => onFormDataChange('status', e.target.value)}
                sx={{
                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: isDarkMode ? '#fff' : '#000',
                  '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <MenuItem value="todo">📝 To Do</MenuItem>
                <MenuItem value="in-progress">🔄 In Progress</MenuItem>
                <MenuItem value="done">✅ Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="medium">
              <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => onFormDataChange('priority', e.target.value)}
                sx={{
                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  color: isDarkMode ? '#fff' : '#000',
                  '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <MenuItem value="low">🔵 Low</MenuItem>
                <MenuItem value="medium">🟡 Medium</MenuItem>
                <MenuItem value="high">🔴 High</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth size="medium" sx={{ mb: 2.5 }}>
            <InputLabel sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>Assign To</InputLabel>
            <Select
              value={formData.assignee}
              label="Assign To"
              onChange={(e) => onFormDataChange('assignee', e.target.value)}
              sx={{
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                color: isDarkMode ? '#fff' : '#000',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <MenuItem value="">
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#6b7280' }}>?</Avatar>
                  <span>Unassigned</span>
                </Box>
              </MenuItem>
              {project.members.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#667eea' }}>
                      {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{member.name}</Typography>
                      <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)', fontSize: '0.7rem' }}>
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Due Date with Dark Mode */}
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => onFormDataChange('dueDate', e.target.value)}
            size="medium"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                '&:hover': { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
              },
              '& input[type="date"]': {
                colorScheme: isDarkMode ? 'dark' : 'light',
                color: isDarkMode ? '#fff' : '#000',
                '&::-webkit-calendar-picker-indicator': {
                  filter: isDarkMode ? 'invert(0.8)' : 'invert(0)',
                  cursor: 'pointer'
                },
                '&::-webkit-datetime-edit': {
                  color: isDarkMode ? 'white' : 'black'
                },
                '&::-webkit-datetime-edit-fields-wrapper': {
                  color: isDarkMode ? 'white' : 'black'
                },
                '&::-webkit-datetime-edit-text': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
                }
              }
            }}
          />
        </Paper>

        {mode === 'edit' && task && (
          <Box sx={{ mb: 2.5 }}>
            <TaskComments taskId={task._id} />
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={handleClear}
          startIcon={<FiRotateCcw />}
          size="medium"
          sx={{
            color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
            }
          }}
        >
          Clear
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onCancel}
            size="medium"
            sx={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              px: 3,
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="medium"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              px: 4,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              },
              transition: 'all 0.2s'
            }}
          >
            {mode === 'create' ? '✨ Create' : '💾 Update'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TaskForm;
