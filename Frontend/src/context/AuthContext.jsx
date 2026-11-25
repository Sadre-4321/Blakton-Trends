import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/helpers';
import { STORAGE_KEYS } from '../constants/appConstants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = getLocalStorage(STORAGE_KEYS.USER);
    const authToken = getLocalStorage(STORAGE_KEYS.AUTH_TOKEN);

    if (storedUser && authToken) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      const { user: newUser, token } = response.data;

      setLocalStorage(STORAGE_KEYS.AUTH_TOKEN, token);
      setLocalStorage(STORAGE_KEYS.USER, newUser);
      setUser(newUser);
      setError(null);
      return newUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      const { user: loggedInUser, token } = response.data;

      setLocalStorage(STORAGE_KEYS.AUTH_TOKEN, token);
      setLocalStorage(STORAGE_KEYS.USER, loggedInUser);
      setUser(loggedInUser);
      setError(null);
      return loggedInUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN);
      removeLocalStorage(STORAGE_KEYS.USER);
      setUser(null);
      setError(null);
    }
  }, []);

  const updateProfile = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(userData);
      const updatedUser = response.data.user;

      setLocalStorage(STORAGE_KEYS.USER, updatedUser);
      setUser(updatedUser);
      setError(null);
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncUser = useCallback((nextUser) => {
    if (!nextUser) return;
    setLocalStorage(STORAGE_KEYS.USER, nextUser);
    setUser(nextUser);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    syncUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
