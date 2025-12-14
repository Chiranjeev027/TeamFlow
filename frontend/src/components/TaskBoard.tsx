// teamflow/frontend/src/components/TaskBoard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../config/apiFetch';
import {
  Dialog,
  Alert
} from '@mui/material';
import { FiPlus, FiUsers, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

import UserPresence from './UserPresence';
import TeamManagement from './TeamManagement';
import TaskColumn from './TaskColumn';
import TaskForm from './TaskForm';
import type { Task, Project, TaskFormData } from '../types';

const TaskBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { socket, updateStatus } = useSocket();
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

  // Auto-set status to online when entering task board
  useEffect(() => {
    updateStatus('online');
  }, []);

  // Data fetching
  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/projects/${projectId}`, {
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
      const response = await apiFetch('/api/tasks', {
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
      const response = await apiFetch(`/api/tasks/${editingTask._id}`, {
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
      await apiFetch(`/api/tasks/${taskId}`, {
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
      const response = await apiFetch(`/api/tasks/${taskId}`, {
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
      <div className="flex justify-center items-center min-h-[400px] flex-col gap-4">
        <div className="w-3/5 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        <div className="flex gap-4 w-full mt-4">
          <div className="flex-1 h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
          <div className="flex-1 h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
          <div className="flex-1 h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600 dark:text-gray-400">Project not found</h2>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/?section=projects', { replace: false })}
              className="p-2 mt-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Back to Projects"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setTeamDialogOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors relative ${isOwner
                ? 'btn-primary'
                : 'btn-outline'
                }`}
            >
              <FiUsers />
              {isOwner ? "Invite Team" : "View Team"} ({getTeamCount()})
              {isOwner && getTeamCount() === 1 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  +
                </span>
              )}
            </button>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              <FiPlus /> Add Task
            </button>
          </div>
        </div>

        {/* User Presence & Quick Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {projectId && <UserPresence projectId={projectId} />}
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, myTasks: !prev.myTasks }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.myTasks
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                My Tasks
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, highPriority: !prev.highPriority }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.highPriority
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                High Priority
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, overdue: !prev.overdue }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.overdue
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, unassigned: !prev.unassigned }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.unassigned
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Unassigned
              </button>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Alerts */}
        {getTeamCount() === 1 && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              bgcolor: 'rgb(30, 58, 138)', // blue-900
              color: 'white',
              '& .MuiAlert-icon': { color: '#60a5fa' }
            }}
          >
            <strong>Want to collaborate?</strong> Click "Team" to invite members to this project.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Task Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
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
          ))}
        </div>

        {/* Dialogs */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <TaskForm
            project={project}
            onSubmit={createTask}
            onCancel={() => setCreateDialogOpen(false)}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            mode="create"
          />
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
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
      </div>
      {/* Floating Add Task Button */}
      <button
        onClick={() => setCreateDialogOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="add task"
      >
        <FiPlus className="w-6 h-6" />
      </button>
    </>
  );
};

export default TaskBoard;
