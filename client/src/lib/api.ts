import axios from 'axios';

// Determine the API base URL based on the environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

// Create an axios instance with the determined base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduflow-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        localStorage.removeItem('eduflow-token');
        localStorage.removeItem('eduflow-user');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 