import axios from 'axios';
import { toast } from 'sonner';

// Determine the API base URL based on the environment
export const API_BASE_URL = (() => {
  // Check if we're in production build
  const isProduction = import.meta.env.MODE === 'production';
  
  // Enhanced debugging for API URL resolution
  console.log('Environment mode:', import.meta.env.MODE);
  console.log('Hostname:', window.location.hostname);
  
  // If on Render.com or other production hosts, always use relative path
  if (isProduction || 
      window.location.hostname.includes('render.com') || 
      window.location.hostname !== 'localhost') {
    console.log('Using production API path: /api');
    return '/api';
  }
  
  // Use environment variable if available (for local development)
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Default fallback for local development
  console.log('Using default development API path: http://localhost:5000/api');
  return 'http://localhost:5000/api';
})();

console.log('Final API Base URL:', API_BASE_URL);

// Create an axios instance with the determined base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout for requests (increased for production)
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduflow-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Request authenticated: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[API] Request NOT authenticated: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Add helpful debugging for connection issues
    if (error.message === 'Network Error' || !error.response) {
      const apiUrl = API_BASE_URL;
      console.error(`API Connection Error to ${apiUrl}:`, error);
      console.error('Current location:', window.location.href);
      
      // More user-friendly error message
      toast.error(
        'Cannot connect to the server. If this persists, please contact support.',
        { duration: 5000 }
      );
      
      return Promise.reject(new Error(`Connection to server at ${apiUrl} failed.`));
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        localStorage.removeItem('eduflow-token');
        localStorage.removeItem('eduflow-user');
        toast.error('Your session has expired. Please sign in again.');
        
        // Use a slight delay to ensure the toast is seen
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      }
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later or contact support.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found. Please check your request or contact support.');
    }
    
    return Promise.reject(error);
  }
);

export default api; 