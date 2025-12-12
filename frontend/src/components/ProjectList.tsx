import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { apiFetch } from '../config/apiFetch';
import { Dialog, Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import { FiPlus, FiMoreHorizontal, FiUsers, FiCalendar, FiTrash2, FiAlertTriangle, FiEdit } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
}

interface ProjectListProps {
  onProjectCreated?: () => void;
}

interface ProjectAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  completionRate: number;
}

interface ProjectListRef {
  openDialog: () => void;
  closeDialog: () => void;
}

const ProjectList = forwardRef<ProjectListRef, ProjectListProps>(({ onProjectCreated }, ref) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [projectAnalytics, setProjectAnalytics] = useState<Record<string, ProjectAnalytics>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      setProjects(data);
      const progressObj: Record<string, number> = {};

      // Only fetch analytics if there are projects
      if (data.length > 0) {
        try {
          const ids = data.map((p: Project) => p._id);
          const token = localStorage.getItem('token');
          const resp = await apiFetch('/api/projects/analytics/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ projectIds: ids })
          });

          if (resp.ok) {
            const analyticsMap = await resp.json();
            for (const id of ids) {
              progressObj[id] = analyticsMap[id]?.completionRate || 0;
            }
            setProjectAnalytics(analyticsMap);
          } else {
            ids.forEach((id: string) => { progressObj[id] = 0; });
          }
        } catch (err) {
          data.forEach((p: Project) => { progressObj[p._id] = 0; });
          setProjectAnalytics({});
        }
      }
      setProjectProgress(progressObj);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false)
  }));

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const openEditDialog = () => {
    if (selectedProject) {
      setProjectToEdit(selectedProject);
      setEditFormData({
        name: selectedProject.name,
        description: selectedProject.description || ''
      });
      setEditDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;

    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/projects/${projectToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }

      const updatedProject = await response.json();
      setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
      setEditDialogOpen(false);
      setProjectToEdit(null);
      setEditFormData({ name: '', description: '' });

    } catch (error: any) {
      console.error('Error updating project:', error);
      alert(error.message || 'Failed to update project. Please try again.');
    }
  };

  const confirmDeleteProject = () => {
    if (selectedProject) {
      setProjectToDelete(selectedProject);
      setDeleteDialogOpen(true);
      handleMenuClose();
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/projects/${projectToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      setProjects(projects.filter(p => p._id !== projectToDelete._id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);

      const newAnalytics = { ...projectAnalytics };
      delete newAnalytics[projectToDelete._id];
      setProjectAnalytics(newAnalytics);

      const newProgress = { ...projectProgress };
      delete newProgress[projectToDelete._id];
      setProjectProgress(newProgress);

    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(error.message || 'Failed to delete project. Please try again.');
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create project');

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setFormData({ name: '', description: '' });
      setOpen(false);

      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const getRandomColor = () => {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] w-full">
        <div className="w-full space-y-4">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <div
            onClick={() => setOpen(true)}
            className="card p-6 cursor-pointer h-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 flex flex-col items-center justify-center text-center transition-all duration-300 group min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
              <FiPlus className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-500 transition-colors">
              Create New Project
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Start a new project for your team
            </p>
          </div>
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleProjectClick(project._id)}
              className="card p-6 cursor-pointer h-full border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-600 relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: getRandomColor() }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, project)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    size="small"
                  >
                    <FiMoreHorizontal className="w-5 h-5" />
                  </IconButton>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {project.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {project.description || 'No description provided'}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${projectProgress[project._id] || 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {projectProgress[project._id] || 0}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-gray-500" />
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800">
                      {project.owner?.name?.charAt(0).toUpperCase() || 'O'}
                    </div>
                    {project.members.slice(0, 3).map((member) => (
                      <div
                        key={member._id}
                        className="w-7 h-7 rounded-full bg-secondary-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800"
                      >
                        {member?.name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                    ))}
                  </div>
                  {project.members.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{project.members.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FiCalendar className="w-3 h-3" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>

              {(projectAnalytics[project._id]?.overdueTasks > 0 || projectAnalytics[project._id]?.highPriorityTasks > 0) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {projectAnalytics[project._id]?.overdueTasks > 0 && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">
                      Overdue: {projectAnalytics[project._id].overdueTasks}
                    </span>
                  )}
                  {projectAnalytics[project._id]?.highPriorityTasks > 0 && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
                      High: {projectAnalytics[project._id].highPriorityTasks}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <FiPlus className="w-10 h-10 text-primary-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            No projects yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Create your first project to get started with organizing your tasks and collaborating with your team.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base"
          >
            <FiPlus className="w-5 h-5" /> CREATE PROJECT
          </button>
        </div>
      )}

      {/* Project Actions Menu with Full Dark Mode Support */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            minWidth: 180,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {selectedProject && user && (selectedProject.owner._id === user.id || selectedProject.owner._id === user._id) && (
          <>
            <MenuItem
              onClick={openEditDialog}
              sx={{
                '&:hover .edit-icon': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#2563eb' }}>
                <FiEdit className="edit-icon transition-transform" style={{ width: '16px', height: '16px' }} />
              </ListItemIcon>
              <ListItemText
                primary="Edit Project"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </MenuItem>
            <MenuItem
              onClick={confirmDeleteProject}
              sx={{
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(239, 68, 68, 0.08)',
                },
                '&:hover .delete-icon': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#dc2626' }}>
                <FiTrash2 className="delete-icon transition-transform" style={{ width: '16px', height: '16px' }} />
              </ListItemIcon>
              <ListItemText
                primary="Delete Project"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'error.main',
                }}
              />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Create Project Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: 'background.paper', color: 'text.primary' }
        }}
      >
        <form onSubmit={createProject} className="p-6 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <h2 className="text-2xl font-semibold mb-2">
            Create New Project
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Start a new project to organize your tasks and collaborate with your team.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-field bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe your project goals, objectives, and team..."
              className="input-field resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2"
            >
              Create Project
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: 'background.paper', color: 'text.primary' }
        }}
      >
        <form onSubmit={handleEditProject} className="p-6 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FiEdit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold">
              Edit Project
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Update your project name and description.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Project Name *
            </label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
              className="input-field bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              rows={3}
              placeholder="Describe your project goals, objectives, and team..."
              className="input-field resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setEditDialogOpen(false)}
              className="px-6 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: 'background.paper', color: 'text.primary' }
        }}
      >
        <div className="p-6 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
            <FiAlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-semibold">Delete Project?</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete <span className="font-bold">{projectToDelete?.name}</span>?
            This action cannot be undone and will delete all associated tasks and data.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="px-6 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProject}
              className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
});

export default ProjectList;