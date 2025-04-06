import axios from 'axios';
import { toast } from 'sonner';

// Determine the API base URL based on the environment
export const API_BASE_URL = (() => {
  // If VITE_API_URL is defined in environment, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, determine based on hostname
  const hostname = window.location.hostname;
  
  // Local development - on localhost or on local IP (192.168.*)
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      /^192\.168\.\d+\.\d+$/.test(hostname)) {
    return 'http://localhost:5000/api';
  }
  
  // Default for production (deployed environment)
  return '/api';
})();

console.log('API Base URL:', API_BASE_URL);

// Create an axios instance with the determined base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout for requests
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
    // Check if error is a network error
    if (error.message === 'Network Error' || !error.response) {
      console.error('API Connection Error:', error);
      toast.error('Cannot connect to the server. Please check your internet connection or try again later.');
      return Promise.reject(new Error('Connection to server failed. Please check if the server is running.'));
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        localStorage.removeItem('eduflow-token');
        localStorage.removeItem('eduflow-user');
        toast.error('Your session has expired. Please sign in again.');
        window.location.href = '/signin';
      }
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later or contact support.');
    }
    
    return Promise.reject(error);
  }
);

export default api; 