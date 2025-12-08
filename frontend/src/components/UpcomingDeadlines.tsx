import React from 'react';
import { apiFetch } from '../config/apiFetch';
import { FiAlertCircle, FiClock, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface Task {
    _id: string;
    title: string;
    dueDate?: string;
    status: string;
    priority?: 'low' | 'medium' | 'high';
    project?: {
        _id: string;
        name: string;
    };
}

const UpcomingDeadlines: React.FC = () => {
    const [deadlines, setDeadlines] = React.useState<Task[]>([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchUpcomingDeadlines();
    }, []);

    const fetchUpcomingDeadlines = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiFetch('/api/tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const tasks = await response.json();

                // Filter tasks with deadlines in the next 7 days
                const now = new Date();
                const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                const upcomingTasks = tasks
                    .filter((task: Task) => {
                        if (!task.dueDate || task.status === 'done') return false;
                        const dueDate = new Date(task.dueDate);
                        return dueDate <= sevenDaysFromNow;
                    })
                    .sort((a: Task, b: Task) =>
                        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
                    )
                    .slice(0, 8); // Limit to 8 items

                setDeadlines(upcomingTasks);
            } else {
                // 404 or other error - just show empty state
                setDeadlines([]);
            }
        } catch (error) {
            console.error('Error fetching deadlines:', error);
            // Show empty state on error
            setDeadlines([]);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (dueDate: string) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        if (diffDays === 0) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
        if (diffDays <= 3) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    };

    const formatDeadline = (dueDate: string) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays <= 7) return `In ${diffDays} days`;
        return due.toLocaleDateString();
    };

    const handleTaskClick = (task: Task) => {
        if (task.project?._id) {
            navigate(`/project/${task.project._id}`);
        }
    };

    if (loading) {
        return (
            <div className="card p-4">
                <h3 className="text-sm font-semibold mb-3">Upcoming Deadlines</h3>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Upcoming Deadlines</h3>
                <FiClock className="w-4 h-4 text-gray-400" />
            </div>

            {deadlines.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <FiCalendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No upcoming deadlines</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {deadlines.map(task => (
                        <div
                            key={task._id}
                            onClick={() => handleTaskClick(task)}
                            className={`p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${getUrgencyColor(task.dueDate!)}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-medium truncate">{task.title}</h4>
                                    {task.project && (
                                        <p className="text-xs opacity-75 mt-1">{task.project.name}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                                    <FiAlertCircle className="w-3 h-3" />
                                    {formatDeadline(task.dueDate!)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingDeadlines;
