'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { applicationService } from '@/app/lib/services/application.service';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import Link from 'next/link';
import { ApplicationStatus, UserRole } from '@/app/types';
import { useState } from 'react';
import {
  Filter,
  Eye,
  MapPin,
  Briefcase,
  Calendar,
  X,
} from 'lucide-react';

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== UserRole.JOB_SEEKER) {
    redirect('/login');
  }

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ApplicationStatus.REVIEWED:
        return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.SHORTLISTED:
        return 'bg-green-100 text-green-800';
      case ApplicationStatus.INTERVIEW:
        return 'bg-purple-100 text-purple-800';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApplicationStatus.OFFERED:
        return 'bg-emerald-100 text-emerald-800';
      case ApplicationStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications =
    statusFilter === 'all'
      ? applications?.data
      : applications?.data.filter((app) => app.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          My Applications
        </h1>
        <p className="text-gray-600">
          Track all your job applications in one place
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.values(ApplicationStatus).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">Loading applications...</p>
          </Card>
        ) : filteredApplications && filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <Card key={application._id} className="hover:shadow-lg transition-shadow">

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-4">
                    {/* {application.job.company.logo && (
                      <img
                        src={application.job.company.logo}
                        alt={application.job.company.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )} */}
                    <div className="flex-1">
                      <Link
                        href={`/jobs/${application.job._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {application.job.title}
                      </Link>
                      {/* <p className="text-gray-600">{application.job.company.name}</p> */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {application.job.location.city},{' '}
                          {application.job.location.country}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {application.job.jobType.replace('_', ' ')}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied{' '}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-4 pl-20">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {application.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                              history.status
                            )}`}
                          >
                            {history.status.replace('_', ' ')}
                          </div>
                          {index < application.statusHistory.length - 1 && (
                            <div className="w-8 h-px bg-gray-300 mx-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ml-6 space-y-2">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status.replace('_', ' ')}
                  </span>
                  <div className="flex flex-col space-y-2">
                    <Link href={`/jobs/${application.job._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
                    </Link>
                    {application.status !== ApplicationStatus.WITHDRAWN &&
                      application.status !== ApplicationStatus.REJECTED && (
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <X className="w-4 h-4 mr-2" />
                          Withdraw
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all'
                ? 'No applications yet'
                : `No ${statusFilter.replace('_', ' ')} applications`}
            </p>
            {statusFilter === 'all' && (
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}