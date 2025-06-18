import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import {
  LoginRequest,
  RegisterRequest,
  AuthState,
  ApiError,
} from '../types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authApi.getToken();
        if (token && authApi.isAuthenticated()) {
          // Validate token by fetching profile
          const user = await authApi.getProfile();
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        // Token is invalid, clear auth data
        authApi.clearAuth();
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const response = await authApi.login(credentials);
      
      setAuthState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    try {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const response = await authApi.register(userData);
      
      setAuthState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.warn('Logout API call failed:', error);
    } finally {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      if (!authState.isAuthenticated) return;

      const user = await authApi.getProfile();
      setAuthState(prev => ({
        ...prev,
        user,
        error: null,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.statusCode === 401) {
        // Token expired, logout user
        await logout();
      } else {
        setAuthState(prev => ({
          ...prev,
          error: apiError.message,
        }));
      }
    }
  }, [authState.isAuthenticated, logout]);

  const clearError = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      return await authApi.validateToken();
    } catch (error) {
      await logout();
      return false;
    }
  }, [logout]);

  return {
    // State
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Actions
    login,
    register,
    logout,
    refreshProfile,
    clearError,
    validateToken,
  };
}; 