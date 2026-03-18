'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { Email, EmailStats } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';

export default function DashboardPage() {
  const [stats, setStats] = useState<EmailStats>({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [emails, setEmails] = useState<Email[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, emailsData] = await Promise.all([
        api.getStats(),
        api.getEmails(pagination.currentPage, 20),
      ]);

      setStats(statsData);
      setEmails(emailsData.emails || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: emailsData.totalPages || 1,
        total: emailsData.total || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Emails</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <Mail className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Sent</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.sent}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Recent Emails Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Emails</h2>
          <button
            onClick={fetchData}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : emails.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No emails yet</p>
            <p className="text-sm mt-2">Start by sending your first email campaign</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emails.map((email) => (
                    <tr key={email._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(email.status)}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {email.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{email.to?.[0] || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{email.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {email.attempts || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {email.sentAt
                          ? new Date(email.sentAt).toLocaleString()
                          : new Date(email.scheduledFor).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  );
}