import axios, { AxiosError } from 'axios';
import { Customer, Email, EmailStats, Template, Config, AuthResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleError = (error: AxiosError) => {
  if (error.response?.data) {
    throw error.response.data;
  }
  throw new Error(error.message || 'An error occurred');
};

export const api = {
  // Auth APIs
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async verify(data: { email: string; code: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/verify', data);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async checkAuth(): Promise<{ user: any }> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async resendCode(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/resend-code', { email });
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Customer APIs
  async getCustomers(page = 1, limit = 50, search = ''): Promise<{
    customers: Customer[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    try {
      const response = await apiClient.get('/customers', {
        params: { page, limit, search },
      });
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async addCustomer(data: Partial<Customer>): Promise<{ success: boolean; customer: Customer }> {
    try {
      const response = await apiClient.post('/customers', data);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<{ success: boolean; customer: Customer }> {
    try {
      const response = await apiClient.put(`/customers/${id}`, data);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Email APIs
  async getEmails(page = 1, limit = 20, status = ''): Promise<{
    emails: Email[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    try {
      const params: any = { page, limit };
      if (status) params.status = status;
      const response = await apiClient.get('/emails', { params });
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async getStats(): Promise<EmailStats> {
    try {
      const response = await apiClient.get('/emails/stats');
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async sendEmail(formData: FormData): Promise<{ success: boolean; recipientCount?: number }> {
    try {
      const response = await apiClient.post('/emails/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Template APIs
  async getTemplates(): Promise<{ templates: Template[] }> {
    try {
      const response = await apiClient.get('/templates');
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async addTemplate(data: Partial<Template>): Promise<{ success: boolean; template: Template }> {
    try {
      const response = await apiClient.post('/templates', data);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async deleteTemplate(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/templates/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  // Config APIs
  async getConfig(): Promise<{ config: Config }> {
    try {
      const response = await apiClient.get('/config');
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  async updateConfig(data: Config): Promise<{ success: boolean; config: Config }> {
    try {
      const response = await apiClient.put('/config', data);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },
};