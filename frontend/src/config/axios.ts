// Axios configuration for API calls
import axios from 'axios';
import { API_BASE_URL } from './api';

// Set base URL for all axios requests
if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
}

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
