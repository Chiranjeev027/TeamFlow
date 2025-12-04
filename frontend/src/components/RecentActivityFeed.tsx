import React from 'react';
import {
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiUsers,
    FiFolder,
    FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface Activity {
    _id: string;
    type: 'project_created' | 'project_updated' | 'project_deleted' | 'task_created' | 'task_updated' | 'task_completed' | 'member_invited';
    user: {
        name: string;
        _id: string;
    };
    description: string;
    createdAt: string;
    project?: {
        name: string;
        _id: string;
    };
}

const RecentActivityFeed: React.FC = () => {
    const [activities, setActivities] = React.useState<Activity[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { user } = useAuth();

    React.useEffect(() => {
        fetchRecentActivities();
        const interval = setInterval(fetchRecentActivities, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchRecentActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!user?.id) return;
            
            const response = await fetch(`/api/activities/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'task_created':
                return <FiFileText className="w-4 h-4 text-blue-500" />;
            case 'task_updated':
                return <FiClock className="w-4 h-4 text-yellow-500" />;
            case 'task_completed':
                return <FiCheckCircle className="w-4 h-4 text-green-500" />;
            case 'project_created':
                return <FiFolder className="w-4 h-4 text-purple-500" />;
            case 'project_updated':
                return <FiFolder className="w-4 h-4 text-blue-500" />;
            case 'project_deleted':
                return <FiTrash2 className="w-4 h-4 text-red-500" />;
            case 'member_invited':
                return <FiUsers className="w-4 h-4 text-pink-500" />;
            default:
                return <FiAlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <button
                    onClick={fetchRecentActivities}
                    className="text-xs text-primary-500 hover:text-primary-600"
                >
                    Refresh
                </button>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiAlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {activities.map(activity => (
                        <div
                            key={activity._id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-semibold">{activity.user.name}</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{activity.description}</span>
                                </p>
                                {activity.project && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        in {activity.project.name}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                                    {formatTimestamp(activity.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentActivityFeed;
