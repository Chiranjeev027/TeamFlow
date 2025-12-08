// API helper to construct full URLs
import { API_BASE_URL } from './api';

/**
 * Makes a fetch request to the backend API
 * Automatically prepends the API base URL in production
 */
export const apiFetch = (endpoint: string, options?: RequestInit) => {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    return fetch(url, options);
};
