import React from 'react';
import { FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  title: string;
  toggleDarkMode: () => void;
  darkMode: boolean;
  showWelcome?: boolean;
  rightContent?: React.ReactNode;
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  toggleDarkMode,
  darkMode,
  showWelcome = true,
  rightContent,
  onMenuClick
}) => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden text-gray-600 dark:text-gray-300"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
          {rightContent}
          {showWelcome && (
            <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              Welcome back, {user?.name}!
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
