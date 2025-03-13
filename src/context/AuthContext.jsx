import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth';
import { getToken, getUserId, isAuthenticated as checkIsAuthenticated } from '../utils/storage';
import { useUserDataStore } from '../store/userData';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user from Zustand store
  const { user, isAuthenticated, addUser, clearUserData } = useUserDataStore();

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (checkIsAuthenticated()) {
          const userId = getUserId();
          if (userId && !user) {
            setLoading(true);
            // Fetch user profile from API
            const userProfile = await authService.getCurrentUserProfile(userId);
            if (userProfile.data) {
              addUser(userProfile.data);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
      setLoading(false);
      throw err;
    }
  }, []);

  const signup = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.signup(username, email, password);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error creating account');
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.forgotPassword(email);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error sending password reset email');
      setLoading(false);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.resetPassword(data);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error resetting password');
      setLoading(false);
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, password, passwordConfirmation) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.changePassword(currentPassword, password, passwordConfirmation);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error changing password');
      setLoading(false);
      throw err;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 