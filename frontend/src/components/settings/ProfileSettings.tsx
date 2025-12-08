import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiSave, FiCamera, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import type { SettingsComponentProps, ProfileData } from './types';

interface ProfileSettingsProps extends SettingsComponentProps { }

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ loading, setLoading, setSuccess, setError }) => {
    const { user, login } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState<ProfileData>({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [profileCompletion, setProfileCompletion] = useState(0);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
            setAvatarPreview(user.avatar || null);

            // Calculate profile completion
            let completion = 0;
            if (user.name) completion += 25;
            if (user.email) completion += 25;
            if (user.avatar) completion += 25;
            if (user.notificationPreferences) completion += 25;
            setProfileCompletion(completion);
        }
    }, [user]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');

            // Upload avatar if changed
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);

                try {
                    await apiFetch('/api/users/avatar', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                } catch (err) {
                    console.log('Avatar upload endpoint not available yet');
                }
            }

            const response = await apiFetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            login(token!, data.user);
            setSuccess('Profile updated successfully!');
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
                <FiUser className="text-primary-500" />
                Profile Settings
            </h2>

            {/* Profile Completion */}
            <div className="mb-8 p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Profile Completion
                    </span>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {profileCompletion}%
                    </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="progress-bar"
                        style={{ width: `${profileCompletion}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                    <div
                        className="avatar-upload-container group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="avatar-upload-overlay group-hover:opacity-100">
                            <FiCamera className="text-white text-2xl" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {user?.name}
                            {user?.isOnline && (
                                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse-subtle"></span>
                            )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                            Change Avatar
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="input-field"
                        required
                    />
                </div>

                {/* Email (readonly) */}
                <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={profileData.email}
                        className="input-field bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75"
                        readOnly
                        disabled
                        title="Email cannot be changed"
                    />
                </div>

                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    <FiSave />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;
