// teamflow/frontend/src/pages/ProjectPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSun, FiMoon, FiDownload, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';
import ActivityFeed from '../components/ActivityFeed';

interface ProjectPageProps {
  toggleDarkMode?: () => void;
  darkMode?: boolean;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ toggleDarkMode, darkMode }) => {
  const { projectId: _projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="flex-grow min-h-screen w-full">
      <header className="bg-primary-500 text-white shadow-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            
            <h1 className="text-xl font-semibold">
              TeamFlow
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.name}</span>
            <button
              onClick={async () => {
                const token = localStorage.getItem('token');
                const [projectRes, tasksRes] = await Promise.all([
                  fetch(`/api/projects/${_projectId}`, { headers: { Authorization: `Bearer ${token}` } }),
                  fetch(`/api/tasks/project/${_projectId}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                const projectData = projectRes.ok ? await projectRes.json() : null;
                const tasksData = tasksRes.ok ? await tasksRes.json() : [];
                const data = { project: projectData, tasks: tasksData, exportedAt: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectData?.project?.name || 'project'}-export.json`;
                a.click();
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiDownload /> Export
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="p-6 w-full grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
        <div>
          <TaskBoard />
        </div>
        <div>
          <ActivityFeed projectId={_projectId!} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;