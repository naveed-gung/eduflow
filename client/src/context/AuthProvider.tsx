import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { 
  signInWithPopup, 
  signInWithCredential, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import api, { API_BASE_URL } from '@/lib/api'; // Import both api instance and API_BASE_URL

// Define user roles
export type UserRole = 'admin' | 'student';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  enrollmentDate?: string;
  courses?: string[];
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Compute isAuthenticated from user state
  const isAuthenticated = !!user;

  // Check for user session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('eduflow-token');
      const storedUser = localStorage.getItem('eduflow-user');
      const tokenExpiry = localStorage.getItem('eduflow-token-expiry');
      
      console.log('AuthProvider - Checking authentication:', { 
        hasToken: !!token, 
        hasStoredUser: !!storedUser,
        hasTokenExpiry: !!tokenExpiry
      });
      
      if (token && storedUser) {
        try {
          // Check if token is expired
          if (tokenExpiry) {
            const expiryDate = new Date(tokenExpiry);
            if (expiryDate < new Date()) {
              // Token expired, clear storage
              console.log('AuthProvider - Token expired, clearing auth data');
              localStorage.removeItem('eduflow-token');
              localStorage.removeItem('eduflow-user');
              localStorage.removeItem('eduflow-token-expiry');
              setIsLoading(false);
              return;
            }
          }
          
          // Set default axios auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // You can validate the token with the server if needed
          // For now, we'll just set the user from local storage
      setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Auth token validation error:', error);
          // Clear invalid auth data
          localStorage.removeItem('eduflow-token');
          localStorage.removeItem('eduflow-user');
          localStorage.removeItem('eduflow-token-expiry');
        }
      }
      
    setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function connected to backend
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
        rememberMe
      });
      
      const { token, user: userData } = response.data;
      
      // Save token and user data
      localStorage.setItem('eduflow-token', token);
      localStorage.setItem('eduflow-user', JSON.stringify(userData));
      
      // If rememberMe is true, store expiration date (30 days from now)
      // If false, session will expire when browser is closed (no need to store)
      if (rememberMe) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        localStorage.setItem('eduflow-token-expiry', expirationDate.toISOString());
      }
      
      // Set default axios auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      
        toast({
          title: "Login Successful",
        description: `Welcome back${userData.name ? ', ' + userData.name : ''}!`,
        });
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Invalid credentials';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-in function
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the Google ID token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential) {
        throw new Error('Failed to get credential from Google sign-in');
      }
      
      const idToken = await result.user.getIdToken();
      
      // Send the ID token to our backend
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        idToken
      });
      
      const { token, user: userData } = response.data;
      
      // Save token and user data
      localStorage.setItem('eduflow-token', token);
      localStorage.setItem('eduflow-user', JSON.stringify(userData));
      
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      
      toast({
        title: "Google Sign-in Successful",
        description: `Welcome${userData.name ? ', ' + userData.name : ''}!`,
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast({
        title: "Google Sign-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Firebase if signed in with Google
      await firebaseSignOut(auth);
      
      // Remove token and user from storage
      localStorage.removeItem('eduflow-token');
      localStorage.removeItem('eduflow-user');
      localStorage.removeItem('eduflow-token-expiry');
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      
    setUser(null);
      
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
      
      // Redirect to signin page
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out properly",
        variant: "destructive",
      });
    }
  };

  // Registration function connected to backend
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      const { token, user: userData } = response.data;
      
      // Save token and user data
      localStorage.setItem('eduflow-token', token);
      localStorage.setItem('eduflow-user', JSON.stringify(userData));
      
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created",
      });
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Could not create account';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated,
      setUser, 
      login, 
      loginWithGoogle, 
      logout, 
      register,
      isAdmin: () => user?.role === 'admin'
    }}>
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
