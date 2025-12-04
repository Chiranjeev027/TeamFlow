import React from 'react';
import {
  FiTrendingUp,
  FiAward,
  FiCheckCircle
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

interface TeamPerformanceProps {
  members: TeamMember[];
}

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ members }) => {
  const totalTasks = members.reduce((acc, member) => acc + member.tasksCompleted, 0);
  const avgTasksPerMember = totalTasks / (members.length || 1);
  const topPerformer = members.reduce((prev, current) => 
    (prev.tasksCompleted > current.tasksCompleted) ? prev : current
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Team Performance
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <FiTrendingUp className="w-8 h-8 text-primary-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">
            Total Tasks Completed
          </h3>
          <p className="text-3xl font-bold text-primary-500">
            {totalTasks}
          </p>
        </div>

        <div className="card">
          <FiCheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">
            Average per Member
          </h3>
          <p className="text-3xl font-bold text-green-500">
            {Math.round(avgTasksPerMember)}
          </p>
        </div>

        <div className="card">
          <FiAward className="w-8 h-8 text-yellow-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">
            Top Performer
          </h3>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
            {topPerformer.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {topPerformer.tasksCompleted} tasks
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Member Performance
        </h3>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member._id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{member.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{member.tasksCompleted} tasks</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((member.tasksCompleted / (topPerformer.tasksCompleted || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPerformance;