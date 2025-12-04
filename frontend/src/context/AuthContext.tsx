import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  createdAt?: string;
  theme?: 'light' | 'dark' | 'system';
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectInvites: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const verifyAuth = async () => {
      try {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/auth/me');

          // Normalize user object to always have id
          const userData = response.data.user;
          const normalizedUser: User = {
            ...userData,
            id: (userData.id || userData._id) as string // Use id if available, otherwise _id
          };

          setUser(normalizedUser);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (token: string, userData: User) => {
    // Ensure user has id field
    const normalizedUser: User = {
      ...userData,
      id: (userData.id || userData._id) as string // Use id if available, otherwise _id
    };

    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(normalizedUser);
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token, user } = response.data;

      // Ensure user has id field
      const normalizedUser: User = {
        ...user,
        id: (user.id || user._id) as string // Use id if available, otherwise _id
      };

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(normalizedUser);
    } catch (error: any) {
      const data = error.response?.data;
      let message = data?.message || 'Registration failed';

      if (data?.errors && Array.isArray(data.errors)) {
        const validationMessages = data.errors.map((err: any) => err.msg).join(', ');
        message = `${message}: ${validationMessages}`;
      }

      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};