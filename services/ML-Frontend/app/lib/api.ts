import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Backend API base URL - adjust this to match your backend server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from localStorage/cookies
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try to get token from localStorage (if stored there)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem('refresh_token') 
          : null;

        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          const { access_token, refresh_token: newRefreshToken } = response.data;

          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access_token);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/AdminDashboard';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),

  // Users
  getUsers: (params?: { status?: string; role?: string; search?: string }) =>
    apiClient.get('/admin/users', { params }),
  updateUserStatus: (id: string, status: 'active' | 'inactive') =>
    apiClient.patch(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id: string, role: 'user' | 'admin' | 'super-admin') =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),

  // Blogs
  getBlogs: () => apiClient.get('/admin/blogs'),
  getBlog: (id: string) => apiClient.get(`/admin/blogs/${id}`),
  createBlog: (data: { title: string; content: string; published?: boolean; tags?: string[] }) =>
    apiClient.post('/admin/blogs', data),
  updateBlog: (id: string, data: { title?: string; content?: string; published?: boolean; tags?: string[] }) =>
    apiClient.put(`/admin/blogs/${id}`, data),
  deleteBlog: (id: string) => apiClient.delete(`/admin/blogs/${id}`),

  // Quotes
  getQuotes: () => apiClient.get('/admin/quotes'),
  createQuote: (data: { text: string; authorName?: string }) =>
    apiClient.post('/admin/quotes', data),
  updateQuote: (id: string, data: { text?: string; authorName?: string }) =>
    apiClient.put(`/admin/quotes/${id}`, data),
  deleteQuote: (id: string) => apiClient.delete(`/admin/quotes/${id}`),

  // Profile
  getProfile: () => apiClient.get('/admin/profile/me'),
  updateProfile: (data: {
    username?: string;
    email?: string;
    themePreference?: string;
    password?: string;
    currentPassword?: string;
  }) => apiClient.patch('/admin/profile/me', data),

  // Audit Logs
  getAuditLogs: (params?: { action?: string; entity?: string; limit?: number }) =>
    apiClient.get('/admin/audit-logs', { params }),
};

export default apiClient;

