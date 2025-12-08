import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../config/apiFetch';
import { FiLock, FiEye, FiEyeOff, FiShield, FiMonitor, FiMapPin } from 'react-icons/fi';
import type { SettingsComponentProps, PasswordData, ShowPasswordsState, PasswordStrength } from './types';

interface SecuritySettingsProps extends SettingsComponentProps { }

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ loading, setLoading, setSuccess, setError }) => {
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState<ShowPasswordsState>({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');

    // Password strength calculator
    useEffect(() => {
        const password = passwordData.newPassword;
        if (!password) {
            setPasswordStrength('weak');
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 1) setPasswordStrength('weak');
        else if (strength === 2) setPasswordStrength('fair');
        else if (strength === 3 || strength === 4) setPasswordStrength('good');
        else setPasswordStrength('strong');
    }, [passwordData.newPassword]);

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak': return 'strength-weak';
            case 'fair': return 'strength-fair';
            case 'good': return 'strength-good';
            case 'strong': return 'strength-strong';
            default: return 'strength-weak';
        }
    };

    const getPasswordStrengthWidth = () => {
        switch (passwordStrength) {
            case 'weak': return '25%';
            case 'fair': return '50%';
            case 'good': return '75%';
            case 'strong': return '100%';
            default: return '0%';
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (passwordStrength === 'weak') {
            setError('Please choose a stronger password');
            setLoading(false);
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await apiFetch('/api/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password');
            }

            setSuccess('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
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
                <FiShield className="text-primary-500" />
                Security Settings
            </h2>

            {/* Change Password */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="input-field pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="input-field pr-10"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {passwordData.newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Password strength:
                                    </span>
                                    <span className={`text-xs font-semibold capitalize ${passwordStrength === 'weak' ? 'text-red-500' :
                                        passwordStrength === 'fair' ? 'text-orange-500' :
                                            passwordStrength === 'good' ? 'text-yellow-500' :
                                                'text-green-500'
                                        }`}>
                                        {passwordStrength}
                                    </span>
                                </div>
                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`strength-bar ${getPasswordStrengthColor()}`}
                                        style={{ width: getPasswordStrengthWidth() }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Use 8+ characters with mix of letters, numbers & symbols
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="input-field pr-10"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <FiLock />
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* Active Sessions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Active Sessions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage devices where you're currently logged in
                </p>

                <div className="space-y-3">
                    {/* Current Session */}
                    <div className="session-card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <FiMonitor className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        Current Device
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <FiMapPin className="w-3 h-3" />
                                        Last active: Just now
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Other sessions placeholder */}
                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                        No other active sessions
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
