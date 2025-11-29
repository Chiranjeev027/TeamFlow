import React, { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiFolder, 
  FiUsers, 
  FiCalendar, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut, 
  FiPlus, 
  FiCheckCircle,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ProjectList from '../components/ProjectList';
import TeamManagementSidebar from '../components/TeamManagementSidebar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import UserSettings from '../components/UserSettings';

interface DashboardProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  isOnline?: boolean;
}

interface DashboardStats {
  totalProjects: number;
  totalTeamMembers: number;
  activeProjects: number;
  completedTasks: number;
  completionRate: number;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleDarkMode, darkMode }) => {
  const { user, logout } = useAuth();
  // Not currently using navigate/location in this page
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

  // Menu items with navigation
  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { id: 'projects', text: 'Projects', icon: <FiFolder className="w-5 h-5" /> },
    { id: 'team', text: 'Team', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'calendar', text: 'Calendar', icon: <FiCalendar className="w-5 h-5" /> },
    { id: 'analytics', text: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" /> },
    { id: 'settings', text: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch projects
      const projectsResponse = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const projectsData = await projectsResponse.json();
      // no long storing projects in state here; only calculate derived stats

      // Calculate unique team members across all projects
      const allTeamMembers = new Map();
      
      projectsData.forEach((project: Project) => {
        // Add owner
        if (!allTeamMembers.has(project.owner._id)) {
          allTeamMembers.set(project.owner._id, {
            _id: project.owner._id,
            name: project.owner.name,
            email: project.owner.email
          });
        }
        
        // Add members
        project.members.forEach((member: any) => {
          if (!allTeamMembers.has(member._id)) {
            allTeamMembers.set(member._id, {
              _id: member._id,
              name: member.name,
              email: member.email
            });
          }
        });
      });

      const uniqueTeamMembers = Array.from(allTeamMembers.values());

      // Fetch analytics for completion rate
      const projectIds = projectsData.map((p: Project) => p._id);
      let totalCompletedTasks = 0;
      let totalTasks = 0;

      if (projectIds.length > 0) {
        const analyticsResponse = await fetch('/api/projects/analytics/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ projectIds })
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          
          totalCompletedTasks = Object.values(analyticsData).reduce((sum: number, projectAnalytics: any) => 
            sum + (projectAnalytics.completedTasks || 0), 0
          );
          
          totalTasks = Object.values(analyticsData).reduce((sum: number, projectAnalytics: any) => 
            sum + (projectAnalytics.totalTasks || 0), 0
          );
        }
      }

      const overallCompletionRate = totalTasks > 0 ? 
        Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

      setStats({
        totalProjects: projectsData.length,
        totalTeamMembers: uniqueTeamMembers.length,
        activeProjects: projectsData.length,
        completedTasks: totalCompletedTasks,
        completionRate: overallCompletionRate
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

            {/* Projects Section */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  Your Projects
                </h2>
                <button className="btn-primary flex items-center gap-2">
                  <FiPlus /> New Project
                </button>
              </div>
              <ProjectList onProjectCreated={fetchDashboardData} />
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
              <button className="btn-primary flex items-center gap-2">
                <FiPlus /> New Project
              </button>
            </div>
            <ProjectList onProjectCreated={fetchDashboardData} />
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
    const section = menuItems.find(item => item.id === activeSection);
    return section ? section.text : 'Dashboard';
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
      {/* Sidebar */}
      <div 
        className="w-[280px] flex-shrink-0 bg-gradient-to-b from-indigo-600 to-purple-700 text-white flex flex-col"
        style={{ height: '100vh', position: 'fixed' }}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-1">
            TeamFlow
          </h1>
          <p className="text-sm opacity-80">
            Project Management
          </p>
        </div>

        <nav className="px-4 mt-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                activeSection === item.id
                  ? 'bg-white/20 border-2 border-white/80'
                  : 'border-2 border-transparent hover:bg-white/10'
              }`}
            >
              <span className="text-white">{item.icon}</span>
              <span className={`text-white ${activeSection === item.id ? 'font-semibold' : 'font-normal'}`}>
                {item.text}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Team Status */}
        <div className="mt-auto p-4">
          <div className="border-t border-white/20 pt-4 mb-4">
            {/* Team Online Status */}
            <div className="mb-4">
              <p className="text-sm text-white/80 mb-2">
                Team Online
              </p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {teamMembers.slice(0, 3).map((member) => (
                    <div 
                      key={member._id}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white ${
                        onlineUsers.some(u => u.userId === member._id) ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-white/70">
                  {onlineUsers.length}/{teamMembers.length} online
                </span>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold mr-3">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-white/80 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-[280px] w-[calc(100%-280px)] overflow-auto">
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getSectionTitle()}
            </h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.name}!
              </p>
            </div>
          </div>
        </header>
        
        <div className="mt-8 pb-8 px-6 w-full max-w-full">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;