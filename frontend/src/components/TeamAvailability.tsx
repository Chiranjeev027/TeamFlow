import React from 'react';
import { FiWifi, FiUsers } from 'react-icons/fi';

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
}

interface TeamAvailabilityProps {
    teamMembers?: TeamMember[];
    onlineUsers?: OnlineUser[];
}

const TeamAvailability: React.FC<TeamAvailabilityProps> = ({ teamMembers = [], onlineUsers = [] }) => {
    // Merge team members with online status
    const membersWithStatus = React.useMemo(() => {
        return teamMembers.map(member => ({
            ...member,
            isOnline: onlineUsers.some(online => online.userId === member._id)
        }));
    }, [teamMembers, onlineUsers]);

    const onlineCount = membersWithStatus.filter(m => m.isOnline).length;
    const offlineCount = membersWithStatus.length - onlineCount;

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
                    {/* Show online members first */}
                    {membersWithStatus
                        .filter(m => m.isOnline)
                        .slice(0, 5)
                        .map(member => (
                            <div
                                key={member._id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{member.name}</p>
                                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <FiWifi className="w-3 h-3" />
                                        <span>Online</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                    {/* Show some offline members */}
                    {onlineCount < 5 && membersWithStatus
                        .filter(m => !m.isOnline)
                        .slice(0, Math.max(0, 5 - onlineCount))
                        .map(member => (
                            <div
                                key={member._id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors opacity-60"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{member.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">Offline</p>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default TeamAvailability;
