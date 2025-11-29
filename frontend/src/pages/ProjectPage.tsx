// teamflow/frontend/src/pages/ProjectPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import TaskBoard from '../components/TaskBoard';
import ActivityFeed from '../components/ActivityFeed';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

interface ProjectPageProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ toggleDarkMode, darkMode }) => {
  const { projectId: _projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [onlineUsers, _setOnlineUsers] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/projects/${_projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.project?.team || []);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [_projectId]);

  const handleExportProject = async () => {
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
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        activeSection="projects"
        onSectionChange={(section) => {
          if (section === 'dashboard') navigate('/');
          else if (section === 'projects') navigate('/');
        }}
        teamMembers={teamMembers}
        onlineUsers={onlineUsers}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-[280px] w-full md:w-[calc(100%-280px)] overflow-auto">
        {/* TopBar Component */}
        <TopBar
          title="Project Board"
          toggleDarkMode={toggleDarkMode!}
          darkMode={darkMode!}
          onMenuClick={() => setIsSidebarOpen(true)}
          rightContent={
            <button
              onClick={handleExportProject}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <FiDownload /> Export
            </button>
          }
        />

        <div className="mt-8 pb-8 px-6 w-full grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
          <div>
            <TaskBoard />
          </div>
          <div>
            <ActivityFeed projectId={_projectId!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;