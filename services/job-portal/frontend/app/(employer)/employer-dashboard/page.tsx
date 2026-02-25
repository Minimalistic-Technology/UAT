'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { jobService } from '@/lib/services/job.service';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { UserRole, JobStatus } from '@/types';

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const { data: jobs } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => jobService.getMyJobs(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      jobService.updateJob(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      toast.success('Job status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update job status');
      console.error(error);
    },
  });

  const handleStatusChange = (jobId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: jobId, status: newStatus });
  };

  const activeJobs = jobs?.data.filter((job) => job.status === JobStatus.ACTIVE).length || 0;
  const totalApplications = jobs?.data.reduce((sum, job) => sum + job.applicationsCount, 0) || 0;
  const totalViews = jobs?.data.reduce((sum, job) => sum + job.viewsCount, 0) || 0;

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== UserRole.EMPLOYER) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Employer Dashboard
          </h1>
          <p className="text-gray-600">Manage your job postings and candidates</p>
        </div>
        <Link href="/post-job">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Active Jobs</p>
              <p className="text-3xl font-bold">{activeJobs}</p>
            </div>
            <Briefcase className="w-12 h-12 text-primary-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Jobs</p>
              <p className="text-3xl font-bold">{jobs?.data.length || 0}</p>
            </div>
            <Briefcase className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Applications</p>
              <p className="text-3xl font-bold">{totalApplications}</p>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Views</p>
              <p className="text-3xl font-bold">{totalViews}</p>
            </div>
            <Eye className="w-12 h-12 text-purple-200" />
          </div>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Job Postings</h2>
          <Link href="/post-job">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs?.data.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.location.city}, {job.location.country}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job._id, e.target.value)}
                      className={`block w-full px-3 py-1 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md shadow-sm ${job.status === JobStatus.ACTIVE
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : job.status === JobStatus.CLOSED
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                    >
                      <option value={JobStatus.ACTIVE}>Active</option>
                      <option value={JobStatus.CLOSED}>Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/employer-dashboard/applicants/${job._id}`}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      {job.applicationsCount}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {job.viewsCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link href={`/jobs/${job._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/employer-dashboard/edit-job/${job._id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!jobs || jobs.data.length === 0) && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No jobs posted yet</p>
              <Link href="/post-job">
                <Button>Post Your First Job</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}