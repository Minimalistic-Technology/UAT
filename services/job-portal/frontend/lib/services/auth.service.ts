import { apiClient } from '../api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

class AuthService {
  async register(data: RegisterData) {
    return apiClient.post('/auth/register', data);
  }

  async login(credentials: LoginCredentials) {
    return apiClient.post('/auth/login', credentials);
  }

  async logout() {
    return apiClient.post('/auth/logout');
  }

  async getMe() {
    return apiClient.get('/auth/me');
  }

  async sendOTP(phone: string) {
    return apiClient.post('/auth/send-otp', { phone });
  }

  async verifyOTP(phone: string, otp: string) {
    return apiClient.post('/auth/verify-otp', { phone, otp });
  }
}

export const authService = new AuthService();