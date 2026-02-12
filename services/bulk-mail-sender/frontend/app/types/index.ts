export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  needsVerification?: boolean;
  devCode?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  company?: string;
  tags?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Email {
  _id: string;
  to: string[];
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  sentAt?: string;
  scheduledFor: string;
  attachments?: any[];
  lastError?: string;
  createdAt?: string;
}

export interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Config {
  _id?: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  retryAttempts: number;
  retryDelay: number;
  isActive?: boolean;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  total: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}