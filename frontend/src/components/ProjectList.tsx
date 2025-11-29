// teamflow/frontend/src/components/ProjectList.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Dialog } from '@mui/material';
import { FiPlus, FiMoreHorizontal, FiUsers, FiCalendar } from 'react-icons/fi';
// No auth usage required here
import { useNavigate } from 'react-router-dom';

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
  // user not required within this component; removed to avoid unused variable
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});
  const [projectAnalytics, setProjectAnalytics] = useState<Record<string, ProjectAnalytics>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data);
      // compute progress for each project (batch request)
      const progressObj: Record<string, number> = {};
      try {
        const ids = data.map((p: Project) => p._id);
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/projects/analytics/batch', {
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
          // If batch fails, fall back to zero progress for all
          ids.forEach((id: string) => { progressObj[id] = 0; });
        }
      } catch (err) {
        data.forEach((p: Project) => { progressObj[p._id] = 0; });
        setProjectAnalytics({});
      }
      setProjectProgress(progressObj);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose open/close dialog functions to parent via ref
  useImperativeHandle(ref, () => ({
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false)
  }));

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
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
      
      // Call the callback to ensure we stay on the projects view
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
      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleProjectClick(project._id)}
              className="card p-6 cursor-pointer h-full border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-600"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: getRandomColor() }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                  <FiMoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {project.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {project.description || 'No description provided'}
              </p>

              {/* Project progress */}
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

              {/* Overdue / high priority indicators */}
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
        // Empty State
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
    </div>
  );
});

export default ProjectList;