'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
  register: (data: { name: string; email: string; password: string }) => Promise<AuthResponse>;
  verify: (data: { email: string; code: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.checkAuth();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const data = await api.login(credentials);
      if (data.success && data.user?.isVerified) {
        setUser(data.user);
        setIsAuthenticated(true);
        router.push('/dashboard');
      }
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    try {
      const data = await api.register(userData);
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const verify = async (verificationData: { email: string; code: string }): Promise<AuthResponse> => {
    try {
      const data = await api.verify(verificationData);
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Verification failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    verify,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}