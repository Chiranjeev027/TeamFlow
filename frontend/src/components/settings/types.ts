// Shared types for Settings components
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface ProfileData {
    name: string;
    email: string;
}

export interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ShowPasswordsState {
    current: boolean;
    new: boolean;
    confirm: boolean;
}

export interface SettingsComponentProps {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    setSuccess: (message: string) => void;
    setError: (message: string) => void;
}
