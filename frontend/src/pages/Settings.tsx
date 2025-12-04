// teamflow/frontend/src/pages/Settings.tsx
import React, { useState } from 'react';
import { FiUser, FiLock, FiDownload } from 'react-icons/fi';
import { Alert } from '@mui/material';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useSocket } from '../context/SocketContext';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import DataPrivacySettings from '../components/settings/DataPrivacySettings';

type TabType = 'profile' | 'security' | 'data';

interface SettingsProps {
    toggleDarkMode: () => void;
    darkMode: boolean;
}

const Settings: React.FC<SettingsProps> = ({ toggleDarkMode, darkMode }) => {
    const { onlineUsers } = useSocket();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const tabs = [
        { id: 'profile' as TabType, label: 'Profile', icon: <FiUser /> },
        { id: 'security' as TabType, label: 'Security', icon: <FiLock /> },
        // { id: 'data' as TabType, label: 'Data & Privacy', icon: <FiDownload /> }
    ];

    const componentProps = {
        loading,
        setLoading,
        setSuccess,
        setError
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Sidebar Component */}
            <Sidebar
                activeSection="settings"
                teamMembers={[]}
                onlineUsers={onlineUsers}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 md:ml-[280px] w-full md:w-[calc(100%-280px)] overflow-auto">
                {/* TopBar Component */}
                <TopBar
                    title="Settings"
                    toggleDarkMode={toggleDarkMode}
                    darkMode={darkMode}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <div className="p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header with gradient */}
                        <div className="mb-8 animate-slide-in">
                            <h1 className="text-4xl font-bold gradient-text mb-2">Settings</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
                        </div>

                        {/* Alerts */}
                        {success && (
                            <Alert severity="success" onClose={() => setSuccess('')} className="mb-4 animate-slide-in">
                                {success}
                            </Alert>
                        )}
                        {error && (
                            <Alert severity="error" onClose={() => setError('')} className="mb-4 animate-slide-in">
                                {error}
                            </Alert>
                        )}

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Sidebar Tabs */}
                            <div className="md:w-64 flex-shrink-0">
                                <div className="card-glass p-2 sticky top-6">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg transform scale-105'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="text-lg">{tab.icon}</span>
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1">
                                <div className="card-glass animate-slide-in">
                                    {activeTab === 'profile' && <ProfileSettings {...componentProps} />}
                                    {activeTab === 'security' && <SecuritySettings {...componentProps} />}
                                    {/* {activeTab === 'data' && <DataPrivacySettings {...componentProps} />} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
