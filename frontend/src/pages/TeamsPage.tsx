// teamflow/frontend/src/pages/TeamsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FiUsers,
  FiUserPlus,
  FiWifi,
  FiShield,
  FiTool
} from 'react-icons/fi';
import TeamMembersList from '../components/TeamMemberList';
import InviteMemberDialog from '../components/InviteMemberDialog';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
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
  avatar?: string;
}

interface TeamsPageProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

const TeamsPage: React.FC<TeamsPageProps> = ({ toggleDarkMode, darkMode }) => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { onlineUsers } = useSocket();

  // Fetch real team data from projects
  useEffect(() => {
    const fetchTeamData = async () => {
      setProjectsLoading(true);
      try {
        const token = localStorage.getItem('token');

        // Fetch projects to get team members
        const projectsResponse = await apiFetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projectsData = await projectsResponse.json();
        console.log('🚀 Projects fetched in TeamsPage:', projectsData);
        setProjects(projectsData);

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
                isOnline: false,
                lastSeen: new Date().toISOString(),
                projects: 0,
                tasksCompleted: 0
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
                  isOnline: false,
                  lastSeen: new Date().toISOString(),
                  projects: 0,
                  tasksCompleted: 0
                });
              }
            });
          }
        });

        // Calculate projects per member
        projectsData.forEach((project: any) => {
          if (project.owner && project.owner._id) {
            const member = allTeamMembersMap.get(project.owner._id);
            if (member) {
              member.projects = (member.projects || 0) + 1;
            }
          }
          if (project.members && Array.isArray(project.members)) {
            project.members.forEach((m: any) => {
              const member = allTeamMembersMap.get(m._id);
              if (member) {
                member.projects = (member.projects || 0) + 1;
              }
            });
          }
        });

        const uniqueTeamMembers = Array.from(allTeamMembersMap.values());
        setTeamMembers(uniqueTeamMembers);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Merge real-time status
  const membersWithStatus = useMemo(() => {
    return teamMembers.map(member => {
      const onlineUser = onlineUsers.find(u => u.userId === member._id);
      return {
        ...member,
        isOnline: !!onlineUser && onlineUser.status === 'online',
        status: onlineUser?.status || 'offline'
      };
    });
  }, [teamMembers, onlineUsers]);

  const onlineCount = membersWithStatus.filter(member => member.isOnline).length;
  const adminCount = membersWithStatus.filter(member => member.role === 'admin').length;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        activeSection="team"
        teamMembers={membersWithStatus}
        onlineUsers={onlineUsers}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-[280px] w-full md:w-[calc(100%-280px)] overflow-auto">
        {/* TopBar Component */}
        <TopBar
          title="Team Management"
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="mt-8 pb-8 px-6 w-full max-w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FiUsers className="text-primary-500" />
                Team Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your team members, roles, and collaboration
              </p>
            </div>
            <button
              onClick={() => setInviteDialogOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiUserPlus /> Invite Team Members
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Total Team Members
              </p>
              <h3 className="text-4xl font-bold mb-2">
                {membersWithStatus.length}
              </h3>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <FiWifi className="w-4 h-4" />
                <span className="text-sm">{onlineCount} online</span>
              </div>
            </div>

            <div className="card p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Team Admins
              </p>
              <h3 className="text-4xl font-bold mb-2">
                {adminCount}
              </h3>
              <FiShield className="text-primary-500 w-6 h-6 mt-2" />
            </div>

            <div className="card p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Active Projects
              </p>
              <h3 className="text-4xl font-bold mb-2">
                {membersWithStatus.reduce((acc, member) => acc + member.projects, 0)}
              </h3>
              <FiTool className="text-secondary-500 w-6 h-6 mt-2" />
            </div>

            <div className="card p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Tasks Completed
              </p>
              <h3 className="text-4xl font-bold mb-2">
                {membersWithStatus.reduce((acc, member) => acc + member.tasksCompleted, 0)}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Based on project activity
              </p>
            </div>
          </div>

          {/* Team Overview */}
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Team Overview
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-2">
                {membersWithStatus.slice(0, 5).map((member) => (
                  <div
                    key={member._id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${member.isOnline
                      ? 'bg-green-500 ring-2 ring-green-400'
                      : member.status === 'busy' ? 'bg-yellow-500 ring-2 ring-yellow-400' : 'bg-gray-500'
                      }`}
                    title={`${member.name} (${member.status || 'offline'})`}
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
                {membersWithStatus.length > 5 && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gray-400">
                    +{membersWithStatus.length - 5}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Team Members
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm border border-green-200 dark:border-green-800">
                    <FiWifi className="w-3 h-3" /> {onlineCount} Online
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700">
                    {membersWithStatus.length - onlineCount} Offline
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 px-6 pt-6">Team Members</h3>
            <div className="p-6 pt-0">
              <TeamMembersList
                members={membersWithStatus}
                onInviteMember={() => setInviteDialogOpen(true)}
              />
            </div>
          </div>

          {/* Invite Member Dialog */}
          <InviteMemberDialog
            open={inviteDialogOpen}
            onClose={() => setInviteDialogOpen(false)}
            projects={projects}
            projectsLoading={projectsLoading}
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

                alert('Member invited successfully!');
                setInviteDialogOpen(false);
              } catch (error: any) {
                console.error('Error inviting member:', error);
                alert(error.message);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;