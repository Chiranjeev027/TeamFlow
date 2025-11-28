// teamflow/frontend/src/components/TaskBoard.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  Alert,
  // CircularProgress (replaced by Skeleton)
  Skeleton,
  Fab
} from '@mui/material';
import { Add, Groups } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

import UserPresence from './UserPresence';
import TeamManagement from './TeamManagement';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import type { Task, Project, TaskFormData } from '../types'; 

const TaskBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const socket = useSocket();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{ myTasks?: boolean; highPriority?: boolean; overdue?: boolean; unassigned?: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: ''
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: '#ef4444' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' }
  ];

  // Data fetching
  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch project');
      
      const data = await response.json();
      setProject(data.project);
      setTasks(data.tasks || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Socket effects
  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      
      if (socket) {
        socket.emit('join-project', projectId);
        
        const socketHandlers = {
          'task-created': (newTask: Task) => setTasks(prev => [...prev, newTask]),
          'task-updated': (updatedTask: Task) => setTasks(prev => 
            prev.map(task => task._id === updatedTask._id ? updatedTask : task)
          ),
          'task-deleted': (deletedTaskId: string) => setTasks(prev => 
            prev.filter(task => task._id !== deletedTaskId)
          ),
          'member-added': fetchProjectData,
          'member-removed': fetchProjectData,
          'connect_error': (_error: any) => setError('Real-time updates disabled - connection issue')
        };

        Object.entries(socketHandlers).forEach(([event, handler]) => {
          socket.on(event, handler);
        });

        return () => {
          if (socket && projectId) {
            socket.emit('leave-project', projectId);
            Object.keys(socketHandlers).forEach(event => {
              socket.off(event);
            });
          }
        };
      }
    }
  }, [projectId, socket]);

  // Keyboard shortcuts (global across TaskBoard)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          setCreateDialogOpen(true);
        }
        if (e.key === 'f' || e.key === 'k') {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Task operations
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, project: projectId })
      });

      if (!response.ok) throw new Error('Failed to create task');
      
      resetForm();
      setCreateDialogOpen(false);
      setError('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingTask)
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      setEditingTask(null);
      setEditDialogOpen(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Drag and drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: 'todo' | 'in-progress' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    updateTaskStatus(taskId, status);
  };

  // Helper functions
  const getTeamCount = () => {
    if (!project) return 0;
    const uniqueMembers = project.members.filter(member => member._id !== project.owner._id);
    return 1 + uniqueMembers.length;
  };

  const isOwner = user && project && user.id && project.owner && 
                  user.id.toString() === project.owner._id.toString();

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: ''
    });
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditDialogOpen(true);
  };

  const handleFormDataChange = (field: string, value: string) => {
    if (editingTask) {
      setEditingTask(prev => prev ? { ...prev, [field]: value } : null);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
        <Skeleton variant="rectangular" width="60%" height={40} sx={{ borderRadius: 1 }} />
        <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h6" color="textSecondary">Project not found</Typography>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">{project.name}</Typography>
          <Typography color="textSecondary">{project.description}</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant={isOwner ? "contained" : "outlined"}
            startIcon={<Groups />}
            onClick={() => setTeamDialogOpen(true)}
            sx={{ position: 'relative' }}
            color={isOwner ? "primary" : "inherit"}
          >
            {isOwner ? "Invite Team" : "View Team"} ({getTeamCount()})
            {isOwner && getTeamCount() === 1 && (
              <Box sx={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, borderRadius: '50%', bgcolor: 'warning.main', color: 'white', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                +
              </Box>
            )}
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
            Add Task
          </Button>
        </Box>
      </Box>

      {/* User Presence & Quick Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {projectId && <UserPresence projectId={projectId} />}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant={filters.myTasks ? 'contained' : 'outlined'} onClick={() => setFilters(prev => ({ ...prev, myTasks: !prev.myTasks }))}>My Tasks</Button>
            <Button variant={filters.highPriority ? 'contained' : 'outlined'} onClick={() => setFilters(prev => ({ ...prev, highPriority: !prev.highPriority }))}>High Priority</Button>
            <Button variant={filters.overdue ? 'contained' : 'outlined'} onClick={() => setFilters(prev => ({ ...prev, overdue: !prev.overdue }))}>Overdue</Button>
            <Button variant={filters.unassigned ? 'contained' : 'outlined'} onClick={() => setFilters(prev => ({ ...prev, unassigned: !prev.unassigned }))}>Unassigned</Button>
          </Box>
        </Box>
        <TextField
          inputRef={searchRef}
          size="small"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 } }}
        />
      </Box>

      {/* Alerts */}
      {getTeamCount() === 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Want to collaborate?</strong> Click "Team" to invite members to this project.
          </Typography>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Task Columns */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3, 
        minHeight: '600px' 
      }}>
        {columns.map((column) => (
          <Box key={column.id} sx={{ flex: 1, minWidth: 0 }}>
            <TaskColumn
              title={column.title}
              color={column.color}
              tasks={tasks
                .filter(task => task.status === column.id)
                .filter(task => !filters.myTasks || (task.assignee && task.assignee._id === user?.id))
                .filter(task => !filters.highPriority || task.priority === 'high')
                .filter(task => !filters.overdue || (task.dueDate && new Date(task.dueDate) < new Date()))
                .filter(task => !filters.unassigned || !task.assignee)
                .filter(task => !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase()))
              }
              status={column.id as 'todo' | 'in-progress' | 'done'}
              onEditTask={openEditDialog}
              onDeleteTask={deleteTask}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
            />
          </Box>
        ))}
      </Box>

      {/* Dialogs */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <TaskForm
          project={project}
          onSubmit={createTask}
          onCancel={() => setCreateDialogOpen(false)}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          mode="create"
        />
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <TaskForm
          task={editingTask}
          project={project}
          onSubmit={updateTask}
          onCancel={() => setEditDialogOpen(false)}
          formData={{
            title: editingTask?.title || '',
            description: editingTask?.description || '',
            status: editingTask?.status || 'todo',
            priority: editingTask?.priority || 'medium',
            assignee: editingTask?.assignee?._id || '',
            dueDate: editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''
          }}
          onFormDataChange={handleFormDataChange}
          mode="edit"
        />
      </Dialog>

      <TeamManagement
        projectId={projectId!}
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
        onTeamUpdate={fetchProjectData}
      />
    </Box>
      {/* Floating Add Task Button */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>
    </>
  );
};

export default TaskBoard;