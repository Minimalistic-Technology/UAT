// Authentication API service functions
import apiClient from './api';

export interface SignupData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  email: string;
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Sign up a new user
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/signup', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (data: PasswordResetData): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
  return response.data;
};

/**
 * Confirm password reset
 */
export const confirmPasswordReset = async (data: PasswordResetConfirmData): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const refreshToken = typeof window !== 'undefined' 
    ? localStorage.getItem('refresh_token') 
    : null;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<AuthResponse>('/auth/refresh-token', {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Even if API call fails, clear local storage
    console.error('Logout error:', error);
  } finally {
    // Clear tokens from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
};

/**
 * Store tokens securely
 */
export const storeTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
};

/**
 * Clear tokens
 */
export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

