import React, { useState } from 'react';
import { FiDownload, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { SettingsComponentProps } from './types';

interface DataPrivacySettingsProps extends SettingsComponentProps { }

const DataPrivacySettings: React.FC<DataPrivacySettingsProps> = ({ loading, setLoading, setSuccess, setError }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    const handleDataExport = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/export', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to export data');
            }

            // Download as JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teamflow-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSuccess('Data exported successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleAccountDelete = async () => {
        if (deleteConfirm !== 'DELETE') {
            setError('Please type DELETE to confirm');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: deletePassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete account');
            }

            logout();
            navigate('/auth');
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <FiDownload className="text-primary-500" />
                Data & Privacy
            </h2>
            <div className="space-y-8">
                {/* Data Export */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Export Your Data</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Download a copy of all your data including projects, tasks, and profile information in JSON format
                    </p>
                    <button onClick={handleDataExport} disabled={loading} className="btn-outline flex items-center gap-2">
                        <FiDownload />
                        {loading ? 'Exporting...' : 'Export Data (JSON)'}
                    </button>
                </div>

                {/* Account Deletion */}
                <div className="border-2 border-red-200 dark:border-red-900 rounded-xl p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-4">
                        <FiAlertTriangle className="w-6 h-6" />
                        <h3 className="text-lg font-bold">Danger Zone</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently deleted and cannot be recovered.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Type "DELETE" to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                className="input-field"
                                placeholder="DELETE"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Enter your password
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <button
                            onClick={handleAccountDelete}
                            disabled={loading || deleteConfirm !== 'DELETE' || !deletePassword}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
                        >
                            <FiTrash2 />
                            {loading ? 'Deleting...' : 'Delete Account Permanently'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataPrivacySettings;
