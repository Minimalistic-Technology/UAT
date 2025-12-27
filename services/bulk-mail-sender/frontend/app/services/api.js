const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth APIs
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  verify: async (verificationData) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData)
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return handleResponse(response);
  },

  checkAuth: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  resendCode: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  // Customer APIs
  getCustomers: async (page = 1, limit = 50, search = '') => {
    const params = new URLSearchParams({ page, limit, search });
    const response = await fetch(`${API_BASE_URL}/customers?${params}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  addCustomer: async (customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(customerData)
    });
    return handleResponse(response);
  },

  updateCustomer: async (id, customerData) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(customerData)
    });
    return handleResponse(response);
  },

  deleteCustomer: async (id) => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Email APIs
  getEmails: async (page = 1, limit = 20, status = '') => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/emails?${params}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/emails/stats`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  sendEmail: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/emails/send`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return handleResponse(response);
  },

  cancelEmail: async (id) => {
    const response = await fetch(`${API_BASE_URL}/emails/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Template APIs
  getTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  addTemplate: async (templateData) => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(templateData)
    });
    return handleResponse(response);
  },

  updateTemplate: async (id, templateData) => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(templateData)
    });
    return handleResponse(response);
  },

  deleteTemplate: async (id) => {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Config APIs
  getConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/config`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  updateConfig: async (configData) => {
    const response = await fetch(`${API_BASE_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(configData)
    });
    return handleResponse(response);
  }
};