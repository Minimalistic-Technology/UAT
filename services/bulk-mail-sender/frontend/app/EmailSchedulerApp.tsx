"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Calendar, Settings, CheckCircle, XCircle, Clock, Mail, AlertCircle, Users, Plus, Edit2, Trash2, Search, UserPlus, Loader, RefreshCw, Download, Upload } from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const EmailSchedulerApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    scheduleDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '10:00',
    endTime: '17:00',
    retryAttempts: 3,
    retryDelay: 5
  });
  
  const [customers, setCustomers] = useState([]);
  const [customerPagination, setCustomerPagination] = useState({
    page: 1,
    limit: 50,
    totalPages: 1,
    total: 0
  });
  
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', company: '', tags: '' });
  
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    scheduleTime: ''
  });
  
  const [sendProgress, setSendProgress] = useState({ show: false, current: 0, total: 0 });
  
  const [emails, setEmails] = useState([]);
  const [emailPagination, setEmailPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0
  });
  
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0
  });

  const customerListRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch config on load
  useEffect(() => {
    fetchConfig();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchEmails();
      fetchStats();
    } else if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'send') {
      fetchCustomers();
    } else if (activeTab === 'settings') {
      fetchConfig();
    }
  }, [activeTab]);

  // Fetch customers when search or pagination changes
  useEffect(() => {
    if (activeTab === 'customers' || activeTab === 'send') {
      fetchCustomers();
    }
  }, [searchDebounce, customerPagination.page]);

  // API Functions
  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/config`);
      const data = await response.json();
      if (data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(customerPagination.page),
        limit: String(customerPagination.limit),
        search: searchDebounce
      });
      
      const response = await fetch(`${API_BASE_URL}/customers?${params}`);
      const data = await response.json();
      
      setCustomers(data.customers || []);
      setCustomerPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      alert('Failed to load customers. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(emailPagination.page),
        limit: String(emailPagination.limit)
      });
      
      const response = await fetch(`${API_BASE_URL}/emails?${params}`);
      const data = await response.json();
      
      setEmails(data.emails || []);
      setEmailPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleConfigChange = (field:any, value:any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day:any) => {
    setConfig(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day]
    }));
  };

  const handleEmailChange = (field:any, value:any) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSelect = (customerId:any) => {
    setSelectedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  const handleSelectAllPage = () => {
    if (customers.every((c:any) => selectedCustomers.has(c._id))) {
      // Deselect all on this page
      setSelectedCustomers(prev => {
        const newSet = new Set(prev);
        customers.forEach((c:any) => newSet.delete(c._id));
        return newSet;
      });
    } else {
      // Select all on this page
      setSelectedCustomers(prev => {
        const newSet = new Set(prev);
        customers.forEach((c:any) => newSet.add(c._id));
        return newSet;
      });
    }
  };

  const handleSelectAllCustomers = async () => {
    if (selectedCustomers.size === customerPagination.total) {
      setSelectedCustomers(new Set());
      return;
    }

    if (customerPagination.total > 1000) {
      alert('For performance reasons, selecting all is limited to 1000 customers. Please use filters or tags to narrow your selection.');
      return;
    }

    try {
      setLoading(true);
      // Fetch all customer IDs
      const response = await fetch(`${API_BASE_URL}/customers?limit=${customerPagination.total}&search=${searchDebounce}`);
      const data = await response.json();
      const allIds = data.customers.map((c:any) => c._id);
      setSelectedCustomers(new Set(allIds));
    } catch (error) {
      console.error('Failed to select all:', error);
      alert('Failed to select all customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          company: newCustomer.company,
          tags: newCustomer.tags ? newCustomer.tags.split(',').map(t => t.trim()) : []
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Customer added successfully!');
        setNewCustomer({ name: '', email: '', company: '', tags: '' });
        setShowAddCustomer(false);
        fetchCustomers();
      } else {
        alert(`Error: ${data.error || 'Failed to add customer'}`);
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
      alert('Failed to add customer. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customers/${editingCustomer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          company: newCustomer.company,
          tags: newCustomer.tags ? newCustomer.tags.split(',').map(t => t.trim()) : []
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Customer updated successfully!');
        setNewCustomer({ name: '', email: '', company: '', tags: '' });
        setEditingCustomer(null);
        setShowAddCustomer(false);
        fetchCustomers();
      } else {
        alert(`Error: ${data.error || 'Failed to update customer'}`);
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = (customer:any) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      company: customer.company || '',
      tags: customer.tags ? customer.tags.join(', ') : ''
    });
    setShowAddCustomer(true);
  };

  const handleDeleteCustomer = async (id:any) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Customer deleted successfully!');
        setSelectedCustomers(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (selectedCustomers.size === 0) {
      alert('Please select at least one customer');
      return;
    }

    if (!emailData.subject || !emailData.body) {
      alert('Please fill in subject and body');
      return;
    }

    if (selectedCustomers.size > 5000) {
      alert('For stability, please limit bulk sends to 5000 recipients at once.');
      return;
    }

    const confirmed = confirm(
      `You are about to schedule ${selectedCustomers.size} email(s).\n\n` +
      `Subject: ${emailData.subject}\n\n` +
      `This will queue all emails for delivery within your configured schedule.\n\n` +
      `Continue?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setSendProgress({ show: true, current: 0, total: selectedCustomers.size });

      const customerIds = Array.from(selectedCustomers);
      const batchSize = 100; // Process 100 at a time
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < customerIds.length; i += batchSize) {
        const batch = customerIds.slice(i, i + batchSize);
        
        const response = await fetch(`${API_BASE_URL}/emails`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerIds: batch,
            subject: emailData.subject,
            body: emailData.body,
            scheduledFor: emailData.scheduleTime || undefined
          })
        });

        if (response.ok) {
          successCount += batch.length;
        } else {
          failCount += batch.length;
        }

        setSendProgress(prev => ({
          ...prev,
          current: Math.min(i + batchSize, customerIds.length)
        }));

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      alert(
        `Email scheduling complete!\n\n` +
        `✓ Success: ${successCount}\n` +
        `✗ Failed: ${failCount}\n\n` +
        `Emails will be sent according to your schedule.`
      );

      // Clear form and selections
      setEmailData({ subject: '', body: '', scheduleTime: '' });
      setSelectedCustomers(new Set());
      fetchStats();
    } catch (error) {
      console.error('Failed to send emails:', error);
      alert('Failed to schedule emails. Please try again.');
    } finally {
      setLoading(false);
      setSendProgress({ show: false, current: 0, total: 0 });
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage:any, type = 'customer') => {
    if (type === 'customer') {
      setCustomerPagination(prev => ({ ...prev, page: newPage }));
    } else {
      setEmailPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusIcon = (status:any) => {
    switch(status) {
      case 'sent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  const Pagination = ({ current, total, onChange }:any) => (
    <div className="flex items-center justify-between px-6 py-3 border-t">
      <div className="text-sm text-gray-700">
        Page {current} of {total}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === total}
          className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      {/* Loading Overlay */}
      {sendProgress.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Scheduling Emails...</h3>
              <p className="text-gray-600 mb-4">
                {sendProgress.current} of {sendProgress.total} processed
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Email Scheduler</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeTab === 'customers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeTab === 'send'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Send Email</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Emails</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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

            {/* Email List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Recent Emails</h2>
                <button
                  onClick={fetchEmails}
                  className="text-blue-600 hover:text-blue-800"
                  title="Refresh"
                >
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {emails.map((email:any) => (
                          <tr key={email._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(email.status)}
                                <span className="text-sm font-medium capitalize">{email.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{email.to?.[0] || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{email.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.attempts}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {email.sentAt ? new Date(email.sentAt).toLocaleString() : 
                               email.scheduledFor ? new Date(email.scheduledFor).toLocaleString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    current={emailPagination.page}
                    total={emailPagination.totalPages}
                    onChange={(page:any) => handlePageChange(page, 'email')}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Customer Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Total: {customerPagination.total} customers</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddCustomer(true);
                    setEditingCustomer(null);
                    setNewCustomer({ name: '', email: '', company: '', tags: '' });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Customer</span>
                </button>
              </div>

              {/* Add/Edit Form */}
              {showAddCustomer && (
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={newCustomer.company}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Tech Corp"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        value={newCustomer.tags}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="vip, active"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingCustomer ? 'Update' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCustomer(false);
                        setEditingCustomer(null);
                      }}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="px-6 py-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Customer List */}
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
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer:any) => (
                          <tr key={customer._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.company || '-'}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {customer.tags?.map((tag:any) => (
                                  <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button onClick={() => handleEditCustomer(customer)} className="text-blue-600 hover:text-blue-800">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteCustomer(customer._id)} className="text-red-600 hover:text-red-800">
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
                    current={customerPagination.page}
                    total={customerPagination.totalPages}
                    onChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Send Email Tab */}
        {activeTab === 'send' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Email to Customers</h2>
            
            <div className="space-y-6">
              {/* Selection Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      {selectedCustomers.size} of {customerPagination.total} customers selected
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAllPage}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {customers.every((c:any) => selectedCustomers.has(c._id)) ? 'Deselect' : 'Select'} Page
                    </button>
                    {customerPagination.total <= 1000 && (
                      <button
                        onClick={handleSelectAllCustomers}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {selectedCustomers.size === customerPagination.total ? 'Deselect' : 'Select'} All
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Customer Selection */}
              <div className="border border-gray-300 rounded-lg">
                <div className="max-h-96 overflow-y-auto" ref={customerListRef}>
                  {loading ? (
                    <div className="p-12 text-center">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No customers found</p>
                      <button
                        onClick={() => setActiveTab('customers')}
                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add customers first
                      </button>
                    </div>
                  ) : (
                    customers.map((customer:any) => (
                      <label
                        key={customer._id}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer._id)}
                          onChange={() => handleCustomerSelect(customer._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.email}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 ml-4">
                              {customer.tags?.map((tag:any) => (
                                <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <Pagination
                  current={customerPagination.page}
                  total={customerPagination.totalPages}
                  onChange={handlePageChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => handleEmailChange('subject', e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Body *</label>
                <textarea
                  value={emailData.body}
                  onChange={(e) => handleEmailChange('body', e.target.value)}
                  placeholder="Enter your email message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={emailData.scheduleTime}
                  onChange={(e) => handleEmailChange('scheduleTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Scheduling Rules:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Emails sent {config.scheduleDays?.join(', ')}</li>
                      <li>Between {config.startTime} - {config.endTime}</li>
                      <li>Failed emails retry {config.retryAttempts} times</li>
                      <li>Batch processing for large volumes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendEmail}
                disabled={loading || selectedCustomers.size === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>Schedule Email to {selectedCustomers.size} Customer(s)</span>
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">SMTP Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={config.smtpHost}
                    onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="text"
                    value={config.smtpPort}
                    onChange={(e) => handleConfigChange('smtpPort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={config.smtpUser}
                    onChange={(e) => handleConfigChange('smtpUser', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={config.smtpPass}
                    onChange={(e) => handleConfigChange('smtpPass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Configuration</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Active Days</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize ${
                          config.scheduleDays?.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={config.startTime}
                      onChange={(e) => handleConfigChange('startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={config.endTime}
                      onChange={(e) => handleConfigChange('endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Failure Handling</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retry Attempts</label>
                  <input
                    type="number"
                    value={config.retryAttempts}
                    onChange={(e) => handleConfigChange('retryAttempts', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retry Delay (min)</label>
                  <input
                    type="number"
                    value={config.retryDelay}
                    onChange={(e) => handleConfigChange('retryDelay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
              <span>Save Configuration</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSchedulerApp;