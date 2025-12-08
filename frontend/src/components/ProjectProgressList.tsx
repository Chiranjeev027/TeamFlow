import React from 'react';
import { FiFolder, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface Project {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt?: string;
    progress?: number;
    deadline?: string;
}

interface ProjectProgressListProps {
    onRefresh?: () => void;
}

const ProjectProgressList: React.FC<ProjectProgressListProps> = () => {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [projectProgress, setProjectProgress] = React.useState<Record<string, number>>({});
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiapiFetch('/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

                // Fetch progress for each project
                const progressData: Record<string, number> = {};
                try {
                    const progressRes = await apiapiFetch('/api/projects/analytics/batch', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ projectIds: data.map((p: Project) => p._id) })
                    });

                    if (progressRes.ok) {
                        const analyticsMap = await progressRes.json();
                        data.forEach((project: Project) => {
                            progressData[project._id] = analyticsMap[project._id]?.completionRate || 0;
                        });
                    }
                } catch (err) {
                    console.warn('Could not fetch progress data');
                }

                // Sort by most recently updated
                const sorted = data.sort((a: any, b: any) => {
                    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                    return dateB - dateA;
                });

                setProjects(sorted);
                setProjectProgress(progressData);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress < 30) return 'bg-red-500';
        if (progress < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const handleProjectClick = (projectId: string) => {
        navigate(`/project/${projectId}`);
    };

    if (loading) {
        return (
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Project Progress</h3>
                <FiTrendingUp className="w-5 h-5 text-gray-400" />
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiFolder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No projects yet</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {projects.slice(0, 6).map(project => {
                        const progress = projectProgress[project._id] || 0;
                        return (
                            <div
                                key={project._id}
                                onClick={() => handleProjectClick(project._id)}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{project.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-2">
                                        {progress}%
                                    </span>
                                </div>

                                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                                    <div
                                        className={`h-2 rounded-full transition-all ${getProgressColor(progress)}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                {project.deadline && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectProgressList;
