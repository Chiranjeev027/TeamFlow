import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiUserPlus,
  FiWifi,
  FiShield,
  FiTool,
  FiEye,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiMinusCircle
} from 'react-icons/fi';
import InviteMemberDialog from './InviteMemberDialog';
import { useSocket } from '../context/SocketContext';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  isOnline: boolean;
  status?: 'online' | 'busy' | 'offline';
  lastSeen: string;
  projects: number;
  tasksCompleted: number;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
}

const TeamManagementSidebar: React.FC = () => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { onlineUsers } = useSocket();

  // Fetch real team data
  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const projectsData: Project[] = await response.json();
      console.log('📊 Fetched projects data:', projectsData);
      console.log('📊 Projects count:', projectsData.length);

      const allTeamMembers = new Map<string, TeamMember>();

      projectsData.forEach(project => {
        // Add owner as admin
        if (project.owner && !allTeamMembers.has(project.owner._id)) {
          allTeamMembers.set(project.owner._id, {
            _id: project.owner._id,
            name: project.owner.name,
            email: project.owner.email,
            role: 'admin',
            projects: 1,
            tasksCompleted: 0,
            isOnline: false,
            lastSeen: new Date().toISOString()
          });
        } else if (project.owner) {
          const member = allTeamMembers.get(project.owner._id);
          if (member) member.projects += 1;
        }

        // Add members
        project.members.forEach((member: any) => {
          if (!allTeamMembers.has(member._id)) {
            allTeamMembers.set(member._id, {
              _id: member._id,
              name: member.name,
              email: member.email,
              role: 'member',
              projects: 1,
              tasksCompleted: 0,
              isOnline: false,
              lastSeen: new Date().toISOString()
            });
          } else {
            const existingMember = allTeamMembers.get(member._id);
            if (existingMember) existingMember.projects += 1;
          }
        });
      });

      const uniqueTeamMembers = Array.from(allTeamMembers.values());
      setTeamMembers(uniqueTeamMembers);
      setProjects(projectsData);
      setProjectCount(projectsData.length);
      console.log('✅ Projects set to state:', projectsData.length);

    } catch (error: any) {
      console.error('❌ Error fetching team data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  // Merge real-time status
  const membersWithStatus = React.useMemo(() => {
    return teamMembers.map(member => {
      const onlineUser = onlineUsers.find(u => u.userId === member._id);
      return {
        ...member,
        isOnline: !!onlineUser,
        status: onlineUser?.status || 'offline'
      };
    });
  }, [teamMembers, onlineUsers]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 5,
      left: rect.left - 150
    });
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const onlineCount = membersWithStatus.filter(member => member.status === 'online').length;
  const busyCount = membersWithStatus.filter(member => member.status === 'busy').length;
  const offlineCount = membersWithStatus.filter(member => member.status === 'offline').length;
  const adminCount = membersWithStatus.filter(member => member.role === 'admin').length;
  const totalProjects = projectCount;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <FiShield className="w-3 h-3" />;
      case 'member': return <FiTool className="w-3 h-3" />;
      case 'viewer': return <FiEye className="w-3 h-3" />;
      default: return <FiTool className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300';
      case 'member': return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-300';
      case 'viewer': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <FiWifi className="w-3 h-3 text-green-500" />;
      case 'busy': return <FiMinusCircle className="w-3 h-3 text-yellow-500" />;
      default: return <FiWifi className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
        Error loading team data: {error}
      </div>
    );
  }

  console.log('🎨 Rendering with projects:', projects.length);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FiUsers className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-bold">Team Management</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your team members, roles, and collaboration
          </p>
        </div>
        <button
          onClick={() => {
            console.log('🔔 Opening invite dialog, projects:', projects.length);
            setInviteDialogOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiUserPlus className="w-4 h-4" />
          Invite Team Members
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Team Members</p>
          <p className="text-3xl font-bold mb-2">{membersWithStatus.length}</p>
          <div className="flex items-center gap-1">
            <FiWifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">{onlineCount} online</span>
          </div>
        </div>

        <div className="card">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Team Admins</p>
          <p className="text-3xl font-bold mb-2">{adminCount}</p>
          <FiShield className="w-5 h-5 text-primary-500" />
        </div>

        <div className="card">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Active Projects</p>
          <p className="text-3xl font-bold mb-2">{totalProjects}</p>
          <FiTool className="w-5 h-5 text-secondary-500" />
        </div>
      </div>

      {/* Team Overview */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-3">Team Overview</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex -space-x-2">
            {membersWithStatus.slice(0, 6).map((member) => (
              <div
                key={member._id}
                title={`${member.name} (${getStatusText(member.status || 'offline')})`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white border-2 border-white dark:border-gray-800 relative ${member.status === 'offline' ? 'bg-gray-400' : 'bg-indigo-500'
                  }`}
              >
                {member.name.charAt(0)}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status || 'offline')}`}></div>
              </div>
            ))}
            {membersWithStatus.length > 6 && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800">
                +{membersWithStatus.length - 6}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                <FiWifi className="w-3 h-3" />
                {onlineCount} Online
              </span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded-full flex items-center gap-1">
                <FiMinusCircle className="w-3 h-3" />
                {busyCount} Busy
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                {offlineCount} Offline
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
        
        <div>
          <div className="space-y-2">
              {membersWithStatus.map((member) => (
                <div
                  key={member._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${member.status === 'offline' ? 'bg-gray-400' : 'bg-indigo-500'
                            }`}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status || 'offline')}`}></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{member.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            {member.role.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(member.status || 'offline')}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {getStatusText(member.status || 'offline')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{member.email}</span>
                          <span>{member.projects} projects</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => handleMenuOpen(e, member)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Context Menu */}
              {anchorEl && selectedMember && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={handleMenuClose}
                  />
                  <div
                    className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[200px] z-20"
                    style={{
                      top: `${menuPosition.top}px`,
                      left: `${menuPosition.left}px`
                    }}
                  >
                    <button
                      onClick={handleMenuClose}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit Role for {selectedMember.name}
                    </button>
                    <button
                      onClick={handleMenuClose}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Remove {selectedMember.name} from Team
                    </button>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        projects={projects}
        onInvite={async (email, _role, projectId) => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/projects/${projectId}/members`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ email })
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to invite member');
            }

            // Refresh team data after inviting
            await fetchTeamData();
            alert('Member invited successfully!');
          } catch (error: any) {
            console.error('Error inviting member:', error);
            alert(error.message);
          }
        }}
      />
    </div>
  );
};

export default TeamManagementSidebar;