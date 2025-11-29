// teamflow/frontend/src/pages/TeamsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiUserPlus,
  FiWifi,
  FiShield,
  FiTool
} from 'react-icons/fi';
import TeamMembersList from '../components/TeamMemberList';
import InviteMemberDialog from '../components/InviteMemberDialog';
import TeamPerformance from '../components/TeamPerformance';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  isOnline: boolean;
  lastSeen: string;
  projects: number;
  tasksCompleted: number;
  avatar?: string;
}

const TeamsPage: React.FC = () => {
  // const { user } = useAuth(); // not used here
  const [tabValue, setTabValue] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // TODO: Replace with actual API call
        const mockTeam: TeamMember[] = [
          {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice@company.com',
            role: 'admin',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            projects: 5,
            tasksCompleted: 42
          },
          {
            _id: '2',
            name: 'Bob Smith',
            email: 'bob@company.com',
            role: 'member',
            isOnline: false,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            projects: 3,
            tasksCompleted: 28
          },
          {
            _id: '3',
            name: 'Carol Davis',
            email: 'carol@company.com',
            role: 'viewer',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            projects: 2,
            tasksCompleted: 15
          }
        ];
        setTeamMembers(mockTeam);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        // no loading state used here
      }
    };

    fetchTeamData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onlineCount = teamMembers.filter(member => member.isOnline).length;
  const adminCount = teamMembers.filter(member => member.role === 'admin').length;

  return (
    <div className="p-6">
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
            {teamMembers.length}
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
            {teamMembers.reduce((acc, member) => acc + member.projects, 0)}
          </h3>
          <FiTool className="text-secondary-500 w-6 h-6 mt-2" />
        </div>

        <div className="card p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Tasks Completed
          </p>
          <h3 className="text-4xl font-bold mb-2">
            {teamMembers.reduce((acc, member) => acc + member.tasksCompleted, 0)}
          </h3>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            +12% this week
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
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  member.isOnline
                    ? 'bg-green-500 ring-2 ring-green-400'
                    : 'bg-gray-500'
                }`}
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            ))}
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
                {teamMembers.length - onlineCount} Offline
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 px-6">
            {['Team Members', 'Performance Analytics', 'Team Settings'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setTabValue(index)}
                className={`px-6 py-4 font-medium transition-colors ${
                  tabValue === index
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tabValue === 0 && (
            <TeamMembersList 
              members={teamMembers} 
              onInviteMember={() => setInviteDialogOpen(true)}
            />
          )}
          {tabValue === 1 && (
            <TeamPerformance members={teamMembers} />
          )}
          {tabValue === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Team Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configure team permissions, notifications, and collaboration settings.
              </p>
              {/* Add team settings form here */}
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog 
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={(email, role) => {
          // TODO: Implement invite logic
          console.log('Inviting:', email, 'as', role);
        }}
      />
    </div>
  );
};

export default TeamsPage;