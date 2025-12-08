import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiCalendar,
  FiActivity
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { apiFetch } from '../config/apiFetch';

interface AnalyticsData {
  completionRate: number;
  velocity: number;
  throughput: number;
  avgTimePerTask: number;
  projectHealthScore: number;
}

interface TaskDistribution {
  status: string;
  count: number;
  color: string;
  [key: string]: string | number; // Index signature for recharts compatibility
}

interface TrendData {
  date: string;
  completed: number;
  created: number;
  velocity: number;
}

interface BurnDownData {
  day: string;
  ideal: number;
  actual: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    completionRate: 0,
    velocity: 0,
    throughput: 0,
    avgTimePerTask: 0,
    projectHealthScore: 0
  });

  const [taskDistribution, setTaskDistribution] = useState<TaskDistribution[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [burnDownData, setBurnDownData] = useState<BurnDownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Listen for task updates via socket to refresh analytics in real-time
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = () => {
      console.log('📊 Task updated, refreshing analytics...');
      fetchAnalytics();
    };

    const handleTaskCreated = () => {
      console.log('📊 Task created, refreshing analytics...');
      fetchAnalytics();
    };

    const handleTaskDeleted = () => {
      console.log('📊 Task deleted, refreshing analytics...');
      fetchAnalytics();
    };

    socket.on('task-updated', handleTaskUpdate);
    socket.on('task-created', handleTaskCreated);
    socket.on('task-deleted', handleTaskDeleted);

    return () => {
      socket.off('task-updated', handleTaskUpdate);
      socket.off('task-created', handleTaskCreated);
      socket.off('task-deleted', handleTaskDeleted);
    };
  }, [socket]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch projects and tasks
      const [projectsRes, tasksRes] = await Promise.all([
        apiFetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        apiFetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!projectsRes.ok || !tasksRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const projects = await projectsRes.json();
      const tasks = await tasksRes.json();

      // Calculate analytics
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate velocity (tasks completed per week)
      const lastWeekTasks = tasks.filter((t: any) => {
        const completedDate = new Date(t.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return t.status === 'done' && completedDate >= weekAgo;
      });
      const velocity = lastWeekTasks.length;

      // Calculate throughput
      const throughput = Math.round(velocity * 4.33); // Monthly estimate

      // Calculate avg time per task (mock for now)
      const avgTimePerTask = 3.5; // days

      // Calculate project health score
      const activeProjects = projects.filter((p: any) => p.status !== 'completed');
      const onTimeProjects = activeProjects.filter((p: any) => {
        const deadline = new Date(p.deadline);
        const today = new Date();
        return deadline > today;
      }).length;
      const projectHealthScore = activeProjects.length > 0
        ? Math.round((onTimeProjects / activeProjects.length) * 100)
        : 100;

      setAnalyticsData({
        completionRate,
        velocity,
        throughput,
        avgTimePerTask,
        projectHealthScore
      });

      // Task distribution by status
      const statusCounts: { [key: string]: { count: number; color: string } } = {
        'todo': { count: 0, color: '#94a3b8' },
        'in-progress': { count: 0, color: '#3b82f6' },
        'review': { count: 0, color: '#f59e0b' },
        'done': { count: 0, color: '#10b981' }
      };

      tasks.forEach((task: any) => {
        const status = task.status || 'todo';
        if (statusCounts[status]) {
          statusCounts[status].count++;
        }
      });

      const distribution = Object.entries(statusCounts).map(([status, data]) => ({
        status: status.replace('-', ' ').toUpperCase(),
        count: data.count,
        color: data.color
      }));

      setTaskDistribution(distribution);

      // Generate trend data (last 30 days)
      const trends: TrendData[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const completedOnDay = tasks.filter((t: any) => {
          const taskDate = new Date(t.updatedAt).toISOString().split('T')[0];
          return t.status === 'done' && taskDate === dateStr;
        }).length;

        const createdOnDay = tasks.filter((t: any) => {
          const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
          return taskDate === dateStr;
        }).length;

        trends.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          completed: completedOnDay,
          created: createdOnDay,
          velocity: completedOnDay
        });
      }

      setTrendData(trends);

      // Generate burn-down chart data
      const totalTasksForBurnDown = totalTasks;
      const daysInSprint = 14;
      const burnDown: BurnDownData[] = [];
      const tasksPerDay = totalTasksForBurnDown / daysInSprint;

      for (let i = 0; i <= daysInSprint; i++) {
        const ideal = Math.max(0, totalTasksForBurnDown - (tasksPerDay * i));
        const actual = Math.max(0, totalTasksForBurnDown - (completedTasks * (i / daysInSprint)));

        burnDown.push({
          day: `Day ${i}`,
          ideal: Math.round(ideal),
          actual: Math.round(actual)
        });
      }

      setBurnDownData(burnDown);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange,
      metrics: analyticsData,
      taskDistribution,
      trends: trendData
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const MetricCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold" style={{ color }}>{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          {React.cloneElement(icon, { className: 'w-6 h-6', style: { color } })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FiBarChart2 className="text-primary-500" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Data-driven insights and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
          <button
            onClick={exportReport}
            className="btn-primary flex items-center gap-2"
          >
            <FiDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Completion Rate"
          value={`${analyticsData.completionRate}%`}
          subtitle="Tasks completed"
          icon={<FiCheckCircle />}
          color="#10b981"
        />
        <MetricCard
          title="Team Velocity"
          value={analyticsData.velocity}
          subtitle="Tasks/week"
          icon={<FiTrendingUp />}
          color="#3b82f6"
        />
        <MetricCard
          title="Throughput"
          value={analyticsData.throughput}
          subtitle="Tasks/month"
          icon={<FiActivity />}
          color="#8b5cf6"
        />
        <MetricCard
          title="Avg Time/Task"
          value={`${analyticsData.avgTimePerTask}d`}
          subtitle="Average duration"
          icon={<FiClock />}
          color="#f59e0b"
        />
        <MetricCard
          title="Project Health"
          value={`${analyticsData.projectHealthScore}%`}
          subtitle="On-time projects"
          icon={<FiCalendar />}
          color="#ec4899"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trends */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-primary-500" />
            Completion Rate Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorCompleted)"
                name="Completed"
              />
              <Area
                type="monotone"
                dataKey="created"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCreated)"
                name="Created"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-primary-500" />
            Task Distribution by Status
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Velocity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiUsers className="text-primary-500" />
            Team Velocity & Throughput
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="velocity"
                fill="#3b82f6"
                name="Tasks Completed"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>


      </div>

      {/* Insights */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              ✅ Strengths
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• High completion rate of {analyticsData.completionRate}%</li>
              <li>• Consistent team velocity of {analyticsData.velocity} tasks/week</li>
              <li>• {analyticsData.projectHealthScore}% of projects are on track</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              💡 Recommendations
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Focus on reducing average task completion time</li>
              <li>• Consider redistributing workload for better throughput</li>
              <li>• Monitor sprint burn-down to stay on schedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;