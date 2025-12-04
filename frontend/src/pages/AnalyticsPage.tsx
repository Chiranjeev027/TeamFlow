import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useSocket } from '../context/SocketContext';

interface AnalyticsPageProps {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ toggleDarkMode, darkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { onlineUsers } = useSocket();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        activeSection="analytics"
        teamMembers={[]}
        onlineUsers={onlineUsers}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-[280px] w-full md:w-[calc(100%-280px)] overflow-auto">
        {/* TopBar Component */}
        <TopBar
          title="Analytics"
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className="mt-8 pb-8 px-6 w-full max-w-full">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
