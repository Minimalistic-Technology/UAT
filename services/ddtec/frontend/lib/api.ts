import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const defaultUrl = isProduction ? 'https://uat-dd.onrender.com' : 'http://localhost:5000';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || defaultUrl,
  withCredentials: true,
  timeout: 20000, // 20 seconds timeout
});

// Add a request interceptor to handle path prefixes and logging
api.interceptors.request.use((config) => {
  // Fix baseURL trailing slash
  if (config.baseURL && !config.baseURL.endsWith('/')) {
    config.baseURL += '/';
  }
  // Fix url leading slash
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
});

// Add a response interceptor for global error handling/logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API SUCCESS] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.msg || error.message || 'Unknown API Error';
    const status = error.response?.status;
    const isClientErr = status === 400 || status === 401 || status === 403;

    const url = error.config?.url || '';
    const isAuthCheck = url.includes('auth/me');
    const isAuthAction = url.includes('auth/login') || url.includes('auth/google') || url.includes('auth/logout') || url.includes('auth/signup');

    if (isAuthCheck && status === 401) {
      console.log('[SESSION] No active session found (User is guest).');
    } else if (isClientErr) {
      console.warn(`[API WARN] ${error.config?.url} (${status}):`, errorMsg);
    } else {
      console.error(`[API ERROR] ${error.config?.url}:`, errorMsg);
    }

    // Global session-expired handling: any authenticated request that comes back
    // with 401 (other than the auth check/login endpoints themselves) means the
    // user's session died server-side mid-use. Notify the app so it can log the
    // user out client-side and redirect them to login.
    if (status === 401 && !isAuthCheck && !isAuthAction && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session-expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
