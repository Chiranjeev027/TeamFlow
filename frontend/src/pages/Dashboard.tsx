import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiFolder,
  FiUsers,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle
} from 'react-icons/fi';

import ProjectList from '../components/ProjectList';
import TeamManagementSidebar from '../components/TeamManagementSidebar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import Settings from './Settings';
import Sidebar from '../components/Sidebar';
import { useSocket } from '../context/SocketContext';
import TopBar from '../components/TopBar';
import RecentActivityFeed from '../components/RecentActivityFeed';
import UpcomingDeadlines from '../components/UpcomingDeadlines';
import TeamAvailability from '../components/TeamAvailability';
import ProjectProgressList from '../components/ProjectProgressList';
import { apiFetch } from '../config/apiFetch';

interface DashboardProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

interface DashboardStats {
  totalProjects: number;
  totalTeamMembers: number;
  activeProjects: number;
  completedTasks: number;
  completionRate: number;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleDarkMode, darkMode }) => {
  // const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTeamMembers: 0,
    activeProjects: 0,
    completedTasks: 0,
    completionRate: 0
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { onlineUsers } = useSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch projects
      const projectsResponse = await apiFetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!projectsResponse.ok) {
        console.error('Projects API failed:', projectsResponse.status, projectsResponse.statusText);
        throw new Error('Failed to fetch projects');
      }
      const projectsData = await projectsResponse.json();
      console.log('Projects data:', projectsData);

      // Fetch tasks (make this optional to not block project stats)
      let tasksData: any[] = [];
      try {
        const tasksResponse = await apiFetch('/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (tasksResponse.ok) {
          tasksData = await tasksResponse.json();
          console.log('Tasks data:', tasksData);
        } else {
          console.warn('Tasks API failed, continuing without task stats:', tasksResponse.status);
        }
      } catch (taskError) {
        console.warn('Error fetching tasks, continuing without task stats:', taskError);
      }

      // Calculate stats
      const activeProjects = projectsData.filter((p: any) => p.status !== 'completed').length;
      const completedTasks = tasksData.filter((t: any) => t.status === 'done').length;
      const totalTasks = tasksData.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Extract unique team members from all projects
      const allTeamMembersMap = new Map<string, TeamMember>();

      projectsData.forEach((project: any) => {
        // Add owner
        if (project.owner && project.owner._id) {
          if (!allTeamMembersMap.has(project.owner._id)) {
            allTeamMembersMap.set(project.owner._id, {
              _id: project.owner._id,
              name: project.owner.name || 'Unknown',
              email: project.owner.email || '',
              role: 'admin',
              isOnline: false
            });
          }
        }

        // Add members
        if (project.members && Array.isArray(project.members)) {
          project.members.forEach((member: any) => {
            if (member._id && !allTeamMembersMap.has(member._id)) {
              allTeamMembersMap.set(member._id, {
                _id: member._id,
                name: member.name || 'Unknown',
                email: member.email || '',
                role: 'member',
                isOnline: false
              });
            }
          });
        }
      });

      const uniqueTeamMembers = Array.from(allTeamMembersMap.values());

      const newStats = {
        totalProjects: projectsData.length,
        totalTeamMembers: uniqueTeamMembers.length,
        activeProjects,
        completedTasks,
        completionRate
      };

      console.log('Setting stats:', newStats);

      setStats(newStats);
      setTeamMembers(uniqueTeamMembers);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for task updates via socket to refresh stats in real-time
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (updatedTask: any) => {
      console.log('📊 Task updated, refreshing dashboard stats...', updatedTask);
      fetchDashboardData();
    };

    const handleTaskCreated = (newTask: any) => {
      console.log('📊 Task created, refreshing dashboard stats...', newTask);
      fetchDashboardData();
    };

    const handleTaskDeleted = (taskId: string) => {
      console.log('📊 Task deleted, refreshing dashboard stats...', taskId);
      fetchDashboardData();
    };

    socket.on('task-updated', handleTaskUpdate);
    socket.on('task-created', handleTaskCreated);
    socket.on('task-deleted', handleTaskDeleted);

    return () => {
      socket.off('task-updated', handleTaskUpdate);
      socket.off('task-created', handleTaskCreated);
      socket.off('task-deleted', handleTaskDeleted);
    };
  }, [socket]);

  // Check for section parameter in URL
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['dashboard', 'projects', 'team', 'calendar', 'analytics', 'settings'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div
      className={`card p-6 h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white'
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-4xl font-bold mb-2">
            {value}
          </h3>
          <h6 className="text-lg opacity-90">
            {title}
          </h6>
          {subtitle && (
            <p className="text-sm opacity-80 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );

  const projectListRef = useRef<any>(null);

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Projects"
                value={stats.totalProjects}
                icon={<FiFolder className="text-white text-3xl" />}
                color="#667eea"
                subtitle={`${stats.activeProjects} active`}
              />
              <StatCard
                title="Team Members"
                value={stats.totalTeamMembers}
                icon={<FiUsers className="text-white text-3xl" />}
                color="#f093fb"
                subtitle={`${teamMembers.filter(m => onlineUsers.some(u => u.userId === m._id && u.status === 'online')).length} online`}
              />
              <StatCard
                title="Tasks Completed"
                value={stats.completedTasks}
                icon={<FiCheckCircle className="text-white text-3xl" />}
                color="#4facfe"
                subtitle="Across all projects"
              />
              <StatCard
                title="Overall Progress"
                value={`${stats.completionRate}%`}
                icon={<FiBarChart2 className="text-white text-3xl" />}
                color="#43e97b"
                subtitle="Completion rate"
              />
            </div>

            {/* Enhanced Dashboard Content - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Left Side (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                <RecentActivityFeed />
                <ProjectProgressList onRefresh={fetchDashboardData} />
              </div>

              {/* Sidebar Widgets - Right Side (1/3 width) */}
              <div className="lg:col-span-1 space-y-6">
                <TeamAvailability
                  teamMembers={teamMembers}
                  onlineUsers={onlineUsers}
                />
                <UpcomingDeadlines />
              </div>
            </div>
          </>
        );

      case 'projects':
        return (
          <div className="card p-6 min-h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-semibold">
                All Projects
              </h1>

            </div>
            <ProjectList ref={projectListRef} onProjectCreated={fetchDashboardData} />
          </div>
        );

      case 'team':
        return <TeamManagementSidebar />;

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'settings':
        return <Settings toggleDarkMode={toggleDarkMode} darkMode={darkMode} />;

      case 'calendar':
        return (
          <div className="card p-6 text-center min-h-[400px] flex flex-col justify-center items-center">
            <FiCalendar className="text-6xl text-primary-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              Calendar View
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Project deadlines, milestones, and team availability will appear here.
            </p>
            <button className="btn-outline">
              Coming Soon
            </button>
          </div>
        );

      default:
        return (
          <div className="card p-6">
            <h2 className="text-2xl">Welcome to TeamFlow</h2>
          </div>
        );
    }
  };

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      projects: 'Projects',
      team: 'Team',
      calendar: 'Calendar',
      analytics: 'Analytics',
      settings: 'Settings'
    };
    return titles[activeSection] || 'Dashboard';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex justify-center items-center w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        teamMembers={teamMembers}
        onlineUsers={onlineUsers}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-[280px] w-full md:w-[calc(100%-280px)] overflow-auto">
        {/* TopBar Component */}
        <TopBar
          title={getSectionTitle()}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="mt-8 pb-8 px-6 w-full max-w-full">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
