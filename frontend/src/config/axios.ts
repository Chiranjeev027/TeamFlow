// Axios configuration for API calls
import axios from 'axios';
import { API_BASE_URL } from './api';

// Debug: Log the API base URL
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

// Set base URL for all axios requests
// Fallback to Render URL if environment variable is not set
const baseURL = API_BASE_URL || 'https://teamflow-zta0.onrender.com';
console.log('🔧 Using baseURL:', baseURL);
axios.defaults.baseURL = baseURL;

// Add request interceptor to include auth token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios;
