"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Calendar, Settings, CheckCircle, XCircle, Clock, Mail, AlertCircle, Users, Plus, Edit2, Trash2, Search, UserPlus, Loader, RefreshCw, LogOut, Save, FileText, Paperclip, X, Eye, Bold, Italic, Underline, List, Link2 } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service
const api = {
  // Auth APIs
  register: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  
  login: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  
  verify: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },
  
  logout: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return await res.json();
  },
  
  checkAuth: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Not authenticated');
    return await res.json();
  },

  // Customer APIs
  getCustomers: async (page = 1, limit = 50, search = '') => {
    const params = new URLSearchParams({ page, limit, search });
    const res = await fetch(`${API_BASE_URL}/customers?${params}`, {
      credentials: 'include'
    });
    return await res.json();
  },

  addCustomer: async (data) => {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  updateCustomer: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  deleteCustomer: async (id) => {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return await res.json();
  },

  // Email APIs
  getEmails: async (page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    const res = await fetch(`${API_BASE_URL}/emails?${params}`, {
      credentials: 'include'
    });
    return await res.json();
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE_URL}/emails/stats`, {
      credentials: 'include'
    });
    return await res.json();
  },

  sendEmail: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/emails/send`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return await res.json();
  },

  // Template APIs
  getTemplates: async () => {
    const res = await fetch(`${API_BASE_URL}/templates`, {
      credentials: 'include'
    });
    return await res.json();
  },

  addTemplate: async (data) => {
    const res = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  deleteTemplate: async (id) => {
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return await res.json();
  },

  // Config APIs
  getConfig: async () => {
    const res = await fetch(`${API_BASE_URL}/config`, {
      credentials: 'include'
    });
    return await res.json();
  },

  updateConfig: async (data) => {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return await res.json();
  }
};

// Rich Text Editor Component
const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded" title="List">
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCommand('createLink', url);
          }}
          className="p-2 hover:bg-gray-200 rounded"
          title="Link"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <select onChange={(e) => execCommand('fontSize', e.target.value)} className="px-2 py-1 border rounded text-sm">
          <option value="3">Normal</option>
          <option value="1">Small</option>
          <option value="5">Large</option>
        </select>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
};

// Login Component
const LoginForm = ({ onSwitchToRegister, onSwitchToVerify, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(formData);
      
      if (data.success) {
        if (!data.user.isVerified) {
          setError('Please verify your email first');
          setTimeout(() => onSwitchToVerify(formData.email), 2000);
        } else {
          onLoginSuccess(data.user);
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Login</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Don't have an account? Register
        </button>
        <br />
        <button
          type="button"
          onClick={() => onSwitchToVerify('')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Verify Email
        </button>
      </div>
    </form>
  );
};

// Register Component
const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.register(formData);
      
      if (data.success) {
        alert(`Registration successful! Verification code: ${data.devCode || 'Check your email'}`);
        onRegisterSuccess(formData.email);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Register</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          minLength="6"
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Already have an account? Login
        </button>
      </div>
    </form>
  );
};

// Verify Component
const VerifyForm = ({ initialEmail, onSwitchToLogin, onVerifySuccess }) => {
  const [formData, setFormData] = useState({ email: initialEmail, code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.verify(formData);
      
      if (data.success) {
        alert('Email verified successfully!');
        onVerifySuccess();
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verify Email</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          placeholder="Enter 6-digit code"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Back to Login
        </button>
      </div>
    </form>
  );
};

// Auth Screen Wrapper
const AuthScreen = ({ onAuthSuccess }) => {
  const [screen, setScreen] = useState('login');
  const [verifyEmail, setVerifyEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Email Scheduler</h1>
          <p className="text-gray-600 mt-2">Manage your email campaigns</p>
        </div>

        {screen === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setScreen('register')}
            onSwitchToVerify={(email) => {
              setVerifyEmail(email);
              setScreen('verify');
            }}
            onLoginSuccess={onAuthSuccess}
          />
        )}

        {screen === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setScreen('login')}
            onRegisterSuccess={(email) => {
              setVerifyEmail(email);
              setScreen('verify');
            }}
          />
        )}

        {screen === 'verify' && (
          <VerifyForm
            initialEmail={verifyEmail}
            onSwitchToLogin={() => setScreen('login')}
            onVerifySuccess={() => setScreen('login')}
          />
        )}
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ current, total, onChange }) => (
  <div className="flex items-center justify-between px-6 py-3 border-t">
    <div className="text-sm text-gray-700">Page {current} of {total}</div>
    <div className="flex space-x-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        Previous
      </button>
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
);

// Dashboard Component
const Dashboard = ({ stats, emails, emailPagination, onPageChange, onRefresh, loading }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'sent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Mail className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Emails</h2>
          <button onClick={onRefresh} className="text-blue-600">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {emails.map(email => (
                    <tr key={email._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(email.status)}
                          <span className="text-sm capitalize">{email.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{email.to?.[0]}</td>
                      <td className="px-6 py-4 text-sm">{email.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {email.sentAt ? new Date(email.sentAt).toLocaleString() : 
                         new Date(email.scheduledFor).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              current={emailPagination.page}
              total={emailPagination.totalPages}
              onChange={onPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Customers Component
const CustomersManager = ({ customers, pagination, searchQuery, onSearchChange, onPageChange, onAdd, onEdit, onDelete, loading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', tags: '' });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Name and email required');
      return;
    }

    const data = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    if (editing) {
      await onEdit(editing._id, data);
      setEditing(null);
    } else {
      await onAdd(data);
    }
    
    setFormData({ name: '', email: '', company: '', tags: '' });
    setShowForm(false);
  };

  const handleEdit = (customer) => {
    setEditing(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      company: customer.company || '',
      tags: customer.tags?.join(', ') || ''
    });
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="text-sm text-gray-600">Total: {pagination.total}</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ name: '', email: '', company: '', tags: '' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {showForm && (
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium mb-4">{editing ? 'Edit' : 'Add'} Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              placeholder="Name *"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              placeholder="Email *"
            />
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              placeholder="Company"
            />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              placeholder="Tags (comma separated)"
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              {editing ? 'Update' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="bg-gray-200 px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map(customer => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-sm">{customer.email}</td>
                    <td className="px-6 py-4 text-sm">{customer.company || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags?.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(customer)} className="text-blue-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(customer._id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No customers found</p>
            </div>
          )}
          <Pagination
            current={pagination.page}
            total={pagination.totalPages}
            onChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

// Email Composer Component
const EmailComposer = ({ 
  customers, 
  pagination, 
  selectedCustomers, 
  onCustomerToggle, 
  onSelectAll,
  emailData, 
  onEmailDataChange,
  templates,
  onUseTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onSend,
  onPageChange,
  loading,
  config
}) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });
  const fileInputRef = useRef(null);

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      alert('Please fill all fields');
      return;
    }
    await onSaveTemplate(newTemplate);
    setShowTemplateModal(false);
    setNewTemplate({ name: '', subject: '', body: '' });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024;
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max 10MB`);
        return false;
      }
      return true;
    });

    onEmailDataChange('attachments', [...emailData.attachments, ...validFiles]);
  };

  const removeAttachment = (index) => {
    onEmailDataChange('attachments', emailData.attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Compose Email</h2>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Save as Template</h3>
              <button onClick={() => setShowTemplateModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Template Name"
              />
              <input
                type="text"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Subject"
              />
              <textarea
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows="6"
                placeholder="Body"
              />
              <div className="flex space-x-3">
                <button onClick={handleSaveTemplate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                  Save
                </button>
                <button onClick={() => setShowTemplateModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Templates */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Templates</label>
            <button
              onClick={() => {
                setNewTemplate({ name: '', subject: emailData.subject, body: emailData.body });
                setShowTemplateModal(true);
              }}
              className="text-sm text-blue-600 flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save as Template</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map(template => (
              <div key={template._id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 cursor-pointer" onClick={() => onUseTemplate(template)}>
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{template.subject}</p>
                  </div>
                  <button onClick={() => onDeleteTemplate(template._id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => onUseTemplate(template)}
                  className="w-full text-xs bg-blue-600 text-white py-1 rounded"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recipients */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Recipients</label>
            <button onClick={onSelectAll} className="text-sm text-blue-600">
              {customers.every(c => selectedCustomers.has(c._id)) ? 'Deselect' : 'Select'} Page
            </button>
          </div>
          <div className="border rounded-lg">
            <div className="p-3 bg-blue-50 border-b">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{selectedCustomers.size} selected</span>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {customers.map(customer => (
                <label key={customer._id} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.has(customer._id)}
                    onChange={() => onCustomerToggle(customer._id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </label>
              ))}
            </div>
            <Pagination current={pagination.page} total={pagination.totalPages} onChange={onPageChange} />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => onEmailDataChange('subject', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Email subject"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body *</label>
          <RichTextEditor
            value={emailData.body}
            onChange={(value) => onEmailDataChange('body', value)}
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed rounded-lg p-4 hover:border-blue-500 flex items-center justify-center space-x-2 text-gray-600"
          >
            <Paperclip className="w-5 h-5" />
            <span>Attach files (Max 10MB)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          {emailData.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {emailData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button onClick={() => removeAttachment(index)} className="text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
          <input
            type="datetime-local"
            value={emailData.scheduleTime}
            onChange={(e) => onEmailDataChange('scheduleTime', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Scheduling Rules:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Emails sent {config.scheduleDays?.join(', ')}</li>
                <li>Between {config.startTime} - {config.endTime}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={loading || selectedCustomers.size === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 font-medium"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span>Schedule to {selectedCustomers.size} Customer(s)</span>
        </button>
      </div>
    </div>
  );
};

// // Settings Component
// const SettingsPanel = ({ config, onConfigChange, onDayToggle, onSave, loading }) => (
//   <div className="space-y-6">
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-xl font-semibold mb-6">SMTP Configuration</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
//           <input
//             type="text"
//             value={config.smtpHost}
//             onChange={(e) => onConfigChange('smtpHost', e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
//           <input
//             type="text"
//             value={config.smtpPort}
//             onChange={(e) => onConfigChange('smtpPort', e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//           <input
//             type="text"
//             value={config.smtpUser}
//             onChange={(e) => onConfigChange('smtpUser', e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//           <input
//             type="password"
//             value={config.smtpPass}
//             onChange={(e) => onConfigChange('smtpPass', e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg"
//           />
//         </div>
//       </div>
//     </div>

//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-xl font-semibold mb-6">Schedule</h2>
//       <div className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-3">Active Days</label>
//           <div className="grid grid-cols-7 gap-2">
//             {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
//               <button
//                 key={day}
//                 onClick={() => onDayToggle(day)}
//                 className={`px-4 py-2 rounded-lg font-medium capitalize ${
//                   config.scheduleDays?.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-100'
//                 }`}
//               >
//                 {day.slice(0, 3)}
//               </button>
//             ))}
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Start</label>
//             <input
//               type="time"
//               value={config.startTime}
//               onChange={(e) => onConfigChange('startTime', e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">End</label>
//             <input
//               type="time"
//               value={config.endTime}
//               onChange={(e) => onConfigChange('endTime', e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//             />
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-xl font-semibold mb-6">Failure Handling</h2>
//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Retry Attempts</label>
//           <input
//             type="number"
//             value={config.retryAttempts}
//             onChange={(e) => onConfigChange('retryAttempts', e.target.value)}
//             className="w-full px-3 py-2 border rounded-lg"
//             min="0"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Delay (min)</label>
//           <input
//             type="number"
//             value={config.ret */)}