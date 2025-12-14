import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiFolder,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  teamMembers?: Array<{ _id: string; name: string; email: string; isOnline?: boolean }>;
  onlineUsers?: Array<{ userId: string; name: string; status?: 'online' | 'busy' | 'offline' }>;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  teamMembers = [],
  onlineUsers = [],
  isOpen,
  onClose
}) => {
  const { user, logout } = useAuth();
  const { onlineUsers: realTimeOnlineUsers, updateStatus } = useSocket();
  const navigate = useNavigate();
  const [statusMenuOpen, setStatusMenuOpen] = React.useState(false);

  // Use real-time online users if available, otherwise fall back to props
  const currentOnlineUsers = realTimeOnlineUsers.length > 0 ? realTimeOnlineUsers : onlineUsers;

  // Get current user's status
  const currentUserStatus = currentOnlineUsers.find(u => u.userId === (user?._id || user?.id))?.status || 'online';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-green-500';
    }
  };

  const handleStatusChange = (status: 'online' | 'busy' | 'offline') => {
    updateStatus(status);
    setStatusMenuOpen(false); // Close menu after selection
  };

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <FiHome className="w-5 h-5" />, path: '/?section=dashboard' },
    { id: 'projects', text: 'Projects', icon: <FiFolder className="w-5 h-5" />, path: '/?section=projects' },
    { id: 'team', text: 'Team', icon: <FiUsers className="w-5 h-5" />, path: '/?section=team' },
    { id: 'calendar', text: 'Calendar', icon: <FiCalendar className="w-5 h-5" />, path: '/?section=calendar' },
    { id: 'analytics', text: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" />, path: '/?section=analytics' },
    { id: 'settings', text: 'Settings', icon: <FiSettings className="w-5 h-5" />, path: '/?section=settings' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    // Update the active section immediately for smooth transition
    if (onSectionChange) {
      onSectionChange(item.id);
    }

    // Also navigate with URL update for all menu items
    navigate(item.path);

    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-gradient-to-b from-indigo-600 to-purple-700 text-white flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
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
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${activeSection === item.id
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

        {/* Sidebar Footer */}
        <div className="mt-auto p-4">
          <div className="border-t border-white/20 pt-4 mb-4">
            {/* Team Online Status - Only show team member avatars if there are team members */}
            {teamMembers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-white/80 mb-2">
                  Team Status
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {teamMembers.slice(0, 3).map((member) => {
                      const memberStatus = currentOnlineUsers.find(u => u.userId === member._id)?.status || 'offline';
                      const bgColor = memberStatus === 'online' ? 'bg-green-500' : memberStatus === 'busy' ? 'bg-yellow-500' : 'bg-gray-500';
                      const statusText = memberStatus === 'online' ? 'Online' : memberStatus === 'busy' ? 'Busy' : 'Offline';

                      return (
                        <div
                          key={member._id}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white ${bgColor}`}
                          title={`${member.name} (${statusText})`}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs text-white/70">
                    {currentOnlineUsers.filter(u =>
                      u.status === 'online' && teamMembers.some(m => m._id === u.userId)
                    ).length} online
                  </span>
                </div>
              </div>
            )}

            {/* User Info and Status - Always visible */}
            <div className="flex items-center mb-3">
              <div className="relative">
                <div
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold mr-3 cursor-pointer transition-transform hover:scale-105"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                {/* Status Menu */}
                {statusMenuOpen && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setStatusMenuOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-2 w-40 z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-1">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Set Status
                          </div>
                          <button
                            onClick={() => handleStatusChange('online')}
                            className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${currentUserStatus === 'online' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Online
                          </button>
                          <button
                            onClick={() => handleStatusChange('busy')}
                            className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${currentUserStatus === 'busy' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            Busy
                          </button>
                          <button
                            onClick={() => handleStatusChange('offline')}
                            className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${currentUserStatus === 'offline' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            Offline
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-white/80 truncate">
                    {user?.email}
                  </p>
                  <div className={`flex items-center gap-1 text-xs ${currentUserStatus === 'online' ? 'text-green-300' :
                    currentUserStatus === 'busy' ? 'text-yellow-300' :
                      'text-gray-400'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(currentUserStatus)}`}></div>
                    <span className="capitalize">{currentUserStatus}</span>
                  </div>
                </div>
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
    </>
  );
};

export default Sidebar;
