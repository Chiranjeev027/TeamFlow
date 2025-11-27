// teamflow/frontend/src/components/TaskBoard.tsx
// Todo OPTIMIZE: Refactor large component into smaller sub-components for TaskCard, TaskDialog, etc.
import React, { useState, useEffect } from 'react';
import UserPresence from './UserPresence';
import TeamManagement from './TeamManagement';
import { Groups } from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Avatar
} from '@mui/material';
import { Add, Schedule, Edit, Delete } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: { _id: string; name: string; email: string };
  dueDate?: string;
  createdBy: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string };
  members: Array<{ _id: string; name: string; email: string }>;
}

const TaskBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const socket = useSocket();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as 'todo' | 'in-progress' | 'done',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    dueDate: ''
  });
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  

  const fetchProjectData = async () => {
    try {
      console.log('🔄 Fetching project data for:', projectId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch project:', errorText);
        throw new Error(`Failed to fetch project: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Project data received:', data);
      console.log('📋 Tasks count:', data.tasks?.length || 0);
      console.log('👥 Team members count:', data.project.members?.length || 0);
      console.log('👑 Project owner:', data.project.owner?.name);
      
      setProject(data.project);
      setTasks(data.tasks || []);
    } catch (error: any) {
      console.error('💥 Error fetching project:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      
      // Socket.io real-time updates
      if (socket) {
        socket.emit('join-project', projectId);
        
        socket.on('task-created', (newTask: Task) => {
          console.log('📦 New task received via socket:', newTask);
          setTasks(prev => [...prev, newTask]);
        });

        socket.on('task-updated', (updatedTask: Task) => {
          console.log('✏️ Task updated via socket:', updatedTask);
          setTasks(prev => prev.map(task => 
            task._id === updatedTask._id ? updatedTask : task
          ));
        });

        socket.on('task-deleted', (deletedTaskId: string) => {
          console.log('🗑️ Task deleted via socket:', deletedTaskId);
          setTasks(prev => prev.filter(task => task._id !== deletedTaskId));
        });

        // Handle team updates
        socket.on('member-added', () => {
          console.log('👥 Member added via socket, refreshing project...');
          fetchProjectData();
        });

        socket.on('member-removed', () => {
          console.log('👥 Member removed via socket, refreshing project...');
          fetchProjectData();
        });

        // Add connection error handling
        socket.on('connect_error', (error) => {
          console.error('🔌 Socket connection error:', error);
          setError('Real-time updates disabled - connection issue');
        });
      }
    }

    return () => {
      if (socket && projectId) {
        socket.emit('leave-project', projectId);
        socket.off('task-created');
        socket.off('task-updated');
        socket.off('task-deleted');
        socket.off('member-added');
        socket.off('member-removed');
        socket.off('connect_error');
      }
    };
  }, [projectId, socket]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('🔄 Creating task with data:', formData);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          project: projectId
        })
      });
      
      console.log('📡 Create task response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to create task:', errorData);
        throw new Error(errorData.error || 'Failed to create task');
      }

      const newTask = await response.json();
      console.log('✅ Task created successfully:', newTask);
      
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: ''
      });
      setOpen(false);
      
      // Show success (we'll rely on socket for update)
      setError('');
    } catch (error: any) {
      console.error('💥 Error creating task:', error);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Function to handle task deletion
  const deleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      
      // Socket event will handle the real-time update
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Function to handle task editing
  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${editTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editTask)
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      setEditTask(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: '#ef4444' },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' }
  ];

  // Function to handle team updates
  const handleTeamUpdate = () => {
    console.log('Team updated, refreshing project data...');
    fetchProjectData();
  };

  // Calculate correct team count - owner + unique members (excluding owner from members array)
  const getTeamCount = () => {
    if (!project) return 0;
    
    // Filter out the owner from members array to avoid double counting
    const uniqueMembers = project.members.filter(member => 
        member._id !== project.owner._id
    );
    
    const totalCount = 1 + uniqueMembers.length; // Owner + unique members
    
    console.log('👥 Team count calculation:');
    console.log('  - Owner:', project.owner.name);
    console.log('  - Current user:', user?.name);
    console.log('  - Is current user owner?', user?.id === project.owner._id);
    console.log('  - Total members in array:', project.members.length);
    console.log('  - Unique members (excluding owner):', uniqueMembers.length);
    console.log('  - Final team count:', totalCount);
    
    return totalCount;
 };
  const isOwner = user && project && user.id.toString() === project.owner._id.toString();
  {import.meta.env.DEV && project && (
    <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
        <strong>Ownership Debug:</strong><br/>
        Current User ID: {user?.id}<br/>
        Project Owner ID: {project.owner._id}<br/>
        IDs Match: {user?.id === project.owner._id ? 'YES' : 'NO'}<br/>
        User: {user?.name}<br/>
        Owner: {project.owner.name}
        </Typography>
    </Alert>
 )}
    console.log('🔑 Ownership check:', { 
    userId: user?.id, 
    ownerId: project?.owner._id, 
    isOwner 
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading project data...
        </Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h6" color="textSecondary">
          Project not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">{project.name}</Typography>
          <Typography color="textSecondary">{project.description}</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant={isOwner ? "contained" : "outlined"}
            startIcon={<Groups />}
            onClick={() => setTeamOpen(true)}
            sx={{ position: 'relative' }}
            color={isOwner ? "primary" : "inherit"}
          >
            {isOwner ? "Invite Team" : "View Team"} ({getTeamCount()})
            {isOwner && getTeamCount() === 1 && (
            <Box
                sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    color: 'white',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                +
            </Box>
         )}
         </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {projectId && <UserPresence projectId={projectId} />} 

      {/* Add invitation helper text */}
      {getTeamCount() === 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Want to collaborate?</strong> Click "Team" to invite members to this project. 
            They'll be able to view and edit all tasks.
          </Typography>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Debug info - show only in development */}
      {import.meta.env.DEV && (
        <Box sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Debug: {tasks.length} tasks loaded • Team: {getTeamCount()} members • Project: {projectId}
          </Typography>
        </Box>
      )}

      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3} sx={{ minHeight: '600px' }}>
        {columns.map((column) => (
          <Paper
            key={column.id}
            elevation={1}
            sx={{
              p: 2,
              minHeight: '100%',
              backgroundColor: '#f8fafc'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as any)}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: column.color,
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
                  backgroundColor: column.color
                }}
              />
              {column.title} 
              <Chip 
                label={tasks.filter(t => t.status === column.id).length} 
                size="small" 
              />
            </Typography>
            
            {tasks
              .filter(task => task.status === column.id)
              .map((task) => (
                <Card
                  key={task._id}
                  sx={{ 
                    mb: 2, 
                    cursor: 'grab',
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {task.description}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip 
                        label={task.priority} 
                        size="small" 
                        color={getPriorityColor(task.priority) as any}
                      />
                      {/* Edit and Delete Buttons */}
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTask(task);
                          }}
                          sx={{ mr: 0.5 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this task?')) {
                              deleteTask(task._id);
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.8rem',
                            bgcolor: task.assignee ? 'primary.main' : 'grey.400'
                          }}
                        >
                          {task.assignee ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Typography variant="caption">
                          {task.assignee?.name || 'Unassigned'}
                        </Typography>
                      </Box>
                      
                      {task.dueDate && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="caption">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Paper>
        ))}
      </Box>

      {/* Create Task Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={createTask} p={3}>
          <Typography variant="h5" gutterBottom>
            Create New Task
          </Typography>
          
          <TextField
            fullWidth
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
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
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          
          <Box mt={3} display="flex" gap={1} justifyContent="flex-end">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Task</Button>
          </Box>
        </Box>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onClose={() => setEditTask(null)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={updateTask} p={3}>
          <Typography variant="h5" gutterBottom>
            Edit Task
          </Typography>
          
          <TextField
            fullWidth
            label="Task Title"
            value={editTask?.title || ''}
            onChange={(e) => setEditTask(prev => prev ? {...prev, title: e.target.value} : null)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            value={editTask?.description || ''}
            onChange={(e) => setEditTask(prev => prev ? {...prev, description: e.target.value} : null)}
            margin="normal"
            multiline
            rows={3}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editTask?.status || 'todo'}
              label="Status"
              onChange={(e) => setEditTask(prev => prev ? {...prev, status: e.target.value as any} : null)}
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={editTask?.priority || 'medium'}
              label="Priority"
              onChange={(e) => setEditTask(prev => prev ? {...prev, priority: e.target.value as any} : null)}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          {/* FIXED: Enhanced Assignee Field */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign to Team Member</InputLabel>
            <Select
              value={editTask?.assignee?._id || ''}
              label="Assign to Team Member"
              onChange={(e) => {
                if (!editTask) return;
                const selectedMember = project?.members.find(member => member._id === e.target.value);
                setEditTask({
                  ...editTask,
                  assignee: selectedMember || undefined
                });
              }}
            >
              <MenuItem value="">
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: 'grey.400' }}>
                    U
                  </Avatar>
                  <span>Unassigned - Anyone can work on this</span>
                </Box>
              </MenuItem>
              {project?.members.map((member) => (
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
            value={editTask?.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditTask(prev => prev ? {...prev, dueDate: e.target.value} : null)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          
          <Box mt={3} display="flex" gap={1} justifyContent="flex-end">
            <Button onClick={() => setEditTask(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Update Task</Button>
          </Box>
        </Box>
      </Dialog>

      <TeamManagement
        projectId={projectId!}
        open={teamOpen}
        onClose={() => setTeamOpen(false)}
        onTeamUpdate={handleTeamUpdate}
      />
    </Box>
  );
};

export default TaskBoard;