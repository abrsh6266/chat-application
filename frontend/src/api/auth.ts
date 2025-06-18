import { apiClient } from './client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../types';

export class AuthApi {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    if (response.data?.access_token) {
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data!;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    if (response.data?.access_token) {
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data!;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data!;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.clearAuthToken();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    apiClient.clearAuthToken();
  }

  /**
   * Refresh user profile data
   */
  async refreshProfile(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }
      return await this.getProfile();
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Validate token by checking profile
   */
  async validateToken(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }
      await this.getProfile();
      return true;
    } catch (error) {
      this.clearAuth();
      return false;
    }
  }
}

export const authApi = new AuthApi();
export default authApi; 