'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Save, Trash2, Paperclip, X, AlertCircle, Loader } from 'lucide-react';
import { api } from '../../lib/api';
import { Customer, Template } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import RichTextEditor from '../../components/ui/RichTextEditor';

export default function SendEmailPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    scheduleTime: '',
    attachments: [] as File[],
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCustomers();
    fetchTemplates();
  }, [pagination.currentPage]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers(pagination.currentPage, 50);
      setCustomers(data.customers || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await api.getTemplates();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleCustomerToggle = (id: string) => {
    setSelectedCustomers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (customers.every((c) => selectedCustomers.has(c._id))) {
      setSelectedCustomers((prev) => {
        const newSet = new Set(prev);
        customers.forEach((c) => newSet.delete(c._id));
        return newSet;
      });
    } else {
      setSelectedCustomers((prev) => {
        const newSet = new Set(prev);
        customers.forEach((c) => newSet.add(c._id));
        return newSet;
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });

    setEmailData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));
  };

  const removeAttachment = (index: number) => {
    setEmailData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleUseTemplate = (template: Template) => {
    setEmailData((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body,
    }));
    alert('Template loaded successfully!');
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      alert('Please fill in all template fields');
      return;
    }

    try {
      await api.addTemplate(newTemplate);
      alert('Template saved successfully!');
      setShowTemplateModal(false);
      setNewTemplate({ name: '', subject: '', body: '' });
      fetchTemplates();
    } catch (error: any) {
      alert(error.message || 'Failed to save template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.deleteTemplate(id);
      fetchTemplates();
    } catch (error: any) {
      alert(error.message || 'Failed to delete template');
    }
  };

  const handleSend = async () => {
    if (selectedCustomers.size === 0) {
      alert('Please select at least one customer');
      return;
    }

    if (!emailData.subject || !emailData.body) {
      alert('Please fill in subject and body');
      return;
    }

    const confirmed = confirm(
      `Schedule email to ${selectedCustomers.size} customer(s) with ${emailData.attachments.length} attachment(s)?`
    );

    if (!confirmed) return;

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('customerIds', JSON.stringify(Array.from(selectedCustomers)));
      formData.append('subject', emailData.subject);
      formData.append('body', emailData.body);

      if (emailData.scheduleTime) {
        formData.append('scheduledFor', emailData.scheduleTime);
      }

      emailData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const result = await api.sendEmail(formData);

      if (result.success) {
        alert(`Successfully scheduled ${result.recipientCount} email(s)!`);
        setEmailData({ subject: '', body: '', scheduleTime: '', attachments: [] });
        setSelectedCustomers(new Set());
      }
    } catch (error: any) {
      alert(error.message || 'Failed to schedule emails');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Save as Template</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="My Template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="Email body"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveTemplate}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compose Email</h2>

        <div className="space-y-6">
          {/* Templates Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Email Templates</label>
              <button
                onClick={() => {
                  setNewTemplate({
                    name: '',
                    subject: emailData.subject,
                    body: emailData.body,
                  });
                  setShowTemplateModal(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save as Template</span>
              </button>
            </div>

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="border border-gray-300 rounded-lg p-3 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                        <p className="text-xs text-gray-500 truncate mt-1">{template.subject}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(template._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 font-medium"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No templates saved yet</p>
            )}
          </div>

          {/* Recipients Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Select Recipients</label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {customers.every((c) => selectedCustomers.has(c._id)) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b border-gray-300">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    {selectedCustomers.size} of {pagination.total} selected
                  </span>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : customers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No customers found</p>
                  <p className="text-sm mt-2">Add customers first to send emails</p>
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto">
                    {customers.map((customer) => (
                      <label
                        key={customer._id}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer._id)}
                          onChange={() => handleCustomerToggle(customer._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.email}</p>
                            </div>
                            {customer.tags && customer.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 ml-4">
                                {customer.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
                  />
                </>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Body *</label>
            <RichTextEditor
              value={emailData.body}
              onChange={(value) => setEmailData({ ...emailData, body: value })}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <Paperclip className="w-5 h-5" />
              <span>Click to attach files (Max 10MB each)</span>
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
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={emailData.scheduleTime}
              onChange={(e) => setEmailData({ ...emailData, scheduleTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to send immediately (within scheduled hours)
            </p>
          </div>

          {/* Info Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Emails will be sent according to your configured schedule</li>
                  <li>Failed emails will be automatically retried</li>
                  <li>You can track delivery status in the Dashboard</li>
                  <li>Attachments will be included with each email</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || selectedCustomers.size === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {sending ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Scheduling Emails...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Schedule Email to {selectedCustomers.size} Customer(s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}