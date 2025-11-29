import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiFolder,
  FiUsers,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiPlus
} from 'react-icons/fi';
import ProjectList from '../components/ProjectList';
import TeamManagementSidebar from '../components/TeamManagementSidebar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserSettings from '../components/UserSettings';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

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
  const { user } = useAuth();
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
  interface OnlineUser { userId: string; name: string; email?: string; projectId?: string }
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects
      const projectsResponse = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const projectsData = await projectsResponse.json();

      // Fetch tasks
      const tasksResponse = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await tasksResponse.json();

      // Calculate stats
      const activeProjects = projectsData.filter((p: any) => p.status !== 'completed').length;
      const completedTasks = tasksData.filter((t: any) => t.status === 'done').length;
      const totalTasks = tasksData.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Extract unique team members from all projects
      const allTeamMembers = projectsData.reduce((acc: TeamMember[], project: any) => {
        return [...acc, ...project.team];
      }, []);

      const uniqueTeamMembers = Array.from(
        new Map(allTeamMembers.map((member: TeamMember) => [member._id, member])).values()
      ) as TeamMember[];

      setStats({
        totalProjects: projectsData.length,
        totalTeamMembers: uniqueTeamMembers.length,
        activeProjects,
        completedTasks,
        completionRate
      });

      setTeamMembers(uniqueTeamMembers);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/online', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const onlineUsersData = await response.json();
        setOnlineUsers(onlineUsersData);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchOnlineUsers();
    
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

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
                subtitle={`${teamMembers.filter(m => m.isOnline).length} online`}
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

            {/* Quick Actions */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Quick Actions</h2>
                <div className="flex gap-2">
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => window.location.href = '/projects'}
                  >
                    <FiPlus /> Projects
                  </button>
                  <button
                    className="btn-outline flex items-center gap-2"
                    onClick={() => window.location.href = '/teams'}
                  >
                    <FiUsers /> Team
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold">Create a Project</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start a project for your team.</p>
                  <div className="mt-3">
                    <button className="btn-primary" onClick={() => window.location.href = '/projects'}>Create Project</button>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold">Invite a Member</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Invite teammates and collaborate faster.</p>
                  <div className="mt-3">
                    <button className="btn-outline" onClick={() => window.location.href = '/teams'}>Invite Member</button>
                  </div>
                </div>
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
                <button className="btn-primary flex items-center gap-2" onClick={() => window.location.href = '/projects'}>
                  <FiPlus /> New Project
                </button>
              </div>
              <ProjectList ref={projectListRef} onProjectCreated={fetchDashboardData} />
          </div>
        );

      case 'team':
        return <TeamManagementSidebar />;

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'settings':
        return <UserSettings />;

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
      />

      {/* Main Content */}
      <div className="flex-1 ml-[280px] w-[calc(100%-280px)] overflow-auto">
        {/* TopBar Component */}
        <TopBar 
          title={getSectionTitle()}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />
        
        <div className="mt-8 pb-8 px-6 w-full max-w-full">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
