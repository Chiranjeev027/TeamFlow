import React from 'react';
import { FiWifi, FiUsers, FiMinusCircle } from 'react-icons/fi';

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    isOnline?: boolean;
    currentProject?: string;
}

interface OnlineUser {
    userId: string;
    name: string;
    email?: string;
    projectId?: string;
    status?: 'online' | 'busy' | 'offline';
}

interface TeamAvailabilityProps {
    teamMembers?: TeamMember[];
    onlineUsers?: OnlineUser[];
}

const TeamAvailability: React.FC<TeamAvailabilityProps> = ({ teamMembers = [], onlineUsers = [] }) => {
    // Merge team members with online status
    const membersWithStatus = React.useMemo(() => {
        return teamMembers.map(member => {
            const onlineUser = onlineUsers.find(online => online.userId === member._id);
            return {
                ...member,
                status: onlineUser ? (onlineUser.status || 'online') : 'offline'
            };
        });
    }, [teamMembers, onlineUsers]);

    const onlineCount = membersWithStatus.filter(m => m.status === 'online').length;
    const busyCount = membersWithStatus.filter(m => m.status === 'busy').length;
    const offlineCount = membersWithStatus.filter(m => m.status === 'offline').length;

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
            case 'online': return <FiWifi className="w-3 h-3" />;
            case 'busy': return <FiMinusCircle className="w-3 h-3" />;
            default: return null;
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

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 dark:text-green-400';
            case 'busy': return 'text-yellow-600 dark:text-yellow-400';
            case 'offline': return 'text-gray-500 dark:text-gray-500';
            default: return 'text-gray-500 dark:text-gray-500';
        }
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Team Availability</h3>
                <FiUsers className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {onlineCount} Online
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {busyCount} Busy
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {offlineCount} Offline
                    </span>
                </div>
            </div>

            {membersWithStatus.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No team members</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {/* Sort by status priority: online -> busy -> offline */}
                    {membersWithStatus
                        .sort((a, b) => {
                            const priority = { online: 0, busy: 1, offline: 2 };
                            return (priority[a.status as keyof typeof priority] || 2) - (priority[b.status as keyof typeof priority] || 2);
                        })
                        .slice(0, 8)
                        .map(member => (
                            <div
                                key={member._id}
                                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${member.status === 'offline' ? 'opacity-60' : ''}`}
                            >
                                <div className="relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${member.status === 'offline' ? 'bg-gray-400' : 'bg-indigo-500'}`}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-gray-900 rounded-full ${getStatusColor(member.status)}`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{member.name}</p>
                                    <div className={`flex items-center gap-1 text-xs ${getStatusTextColor(member.status)}`}>
                                        {getStatusIcon(member.status)}
                                        <span>{getStatusText(member.status)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default TeamAvailability;
