'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { UserRole, JobStatus } from '@/app/types';
import { apiClient } from '@/app/lib/api';
import { toast } from 'sonner';
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<'users' | 'jobs' | 'analytics'>('users');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/login');
  }

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/admin/stats');
      return response;
    },
  });

  // Fetch pending jobs
  const { data: pendingJobs, refetch: refetchJobs } = useQuery({
    queryKey: ['admin-pending-jobs'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/admin/jobs?status=pending');
      return response;
    },
  });

  // Fetch all users
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/admin/users');
      return response;
    },
  });

  // Approve job mutation
  const approveJobMutation = useMutation({
    mutationFn: (jobId: string) =>
      apiClient.put(`/admin/jobs/${jobId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      toast.success('Job approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve job');
    },
  });

  // Reject job mutation
  const rejectJobMutation = useMutation({
    mutationFn: (jobId: string) =>
      apiClient.put(`/admin/jobs/${jobId}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      toast.success('Job rejected');
    },
    onError: () => {
      toast.error('Failed to reject job');
    },
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiClient.put(`/admin/users/${userId}/toggle-status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform users, jobs, and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold">{stats?.data?.totalUsers || 0}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Jobs</p>
              <p className="text-3xl font-bold">{stats?.data?.totalJobs || 0}</p>
            </div>
            <Briefcase className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Applications</p>
              <p className="text-3xl font-bold">{stats?.data?.totalApplications || 0}</p>
            </div>
            <FileText className="w-12 h-12 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Pending Jobs</p>
              <p className="text-3xl font-bold">
                {pendingJobs?.data?.length || 0}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-200" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('users')}
              className={`${
                selectedTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users Management
            </button>
            <button
              onClick={() => setSelectedTab('jobs')}
              className={`${
                selectedTab === 'jobs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Jobs
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`${
                selectedTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Users Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users?.data?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === UserRole.EMPLOYER
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === UserRole.ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant={user.isActive ? 'danger' : 'primary'}
                        onClick={() =>
                          toggleUserStatusMutation.mutate({
                            userId: user.id,
                            isActive: !user.isActive,
                          })
                        }
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pending Jobs Tab */}
      {selectedTab === 'jobs' && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Job Approvals
          </h2>
          <div className="space-y-4">
            {pendingJobs?.data?.map((job: any) => (
              <div
                key={job.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {job.company.name} • {job.location.city}, {job.location.country}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {job.jobType.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {job.experienceLevel}
                      </span>
                      {job.location.remote && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          Remote
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <div className="ml-6 space-y-2">
                    <Button
                      size="sm"
                      onClick={() => approveJobMutation.mutate(job.id)}
                      loading={approveJobMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => rejectJobMutation.mutate(job.id)}
                      loading={rejectJobMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {(!pendingJobs || pendingJobs.data?.length === 0) && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No pending jobs to review</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Growth
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <TrendingUp className="w-12 h-12 mb-2" />
              <p>Chart coming soon...</p>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Applications</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.data?.totalApplications || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="text-2xl font-bold text-primary-600">
                  {stats?.data?.monthlyApplications || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats?.data?.successRate || 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}