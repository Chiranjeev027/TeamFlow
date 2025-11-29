import React from 'react';
import {
  FiMoreVertical,
  FiWifi,
  FiShield,
  FiTool,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUserPlus
} from 'react-icons/fi';

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

interface TeamMembersListProps {
  members: TeamMember[];
  onInviteMember: () => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ members, onInviteMember }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

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

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });

  const handleMenuOpenWithPosition = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 5, left: rect.left - 150 });
    handleMenuOpen(event, member);
  };

  return (
    <div>
      {members.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No team members yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Start by inviting team members to collaborate on projects.
          </p>
          {onInviteMember && (
            <button onClick={onInviteMember} className="btn-primary flex items-center gap-2 mx-auto">
              <FiUserPlus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      member.isOnline ? 'bg-green-500 ring-2 ring-green-300' : 'bg-gray-400'
                    }`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{member.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1">
                        {member.isOnline ? (
                          <FiWifi className="w-3 h-3 text-green-500" />
                        ) : (
                          <FiWifi className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {member.isOnline ? 'Online' : `Last seen ${formatLastSeen(member.lastSeen)}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{member.email}</span>
                      <span>{member.projects} projects</span>
                      <span className="text-green-600 dark:text-green-400">{member.tasksCompleted} tasks completed</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleMenuOpenWithPosition(e, member)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <FiMoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context Menu */}
      {anchorEl && selectedMember && (
        <>
          <div className="fixed inset-0 z-10" onClick={handleMenuClose} />
          <div
            className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[200px] z-20"
            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          >
            <button
              onClick={handleMenuClose}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FiEdit2 className="w-4 h-4" />
              Edit Role {selectedMember ? `for ${selectedMember.name}` : ''}
            </button>
            <button
              onClick={handleMenuClose}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2"
            >
              <FiTrash2 className="w-4 h-4" />
              Remove from Team
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamMembersList;