import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="card p-6 text-center min-h-[400px] flex flex-col justify-center items-center">
      <FiBarChart2 className="w-16 h-16 text-primary-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">
        Analytics Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Project performance metrics, team velocity, and completion analytics will appear here.
      </p>
      <button className="btn-outline">
        Coming Soon
      </button>
    </div>
  );
};

export default AnalyticsDashboard;