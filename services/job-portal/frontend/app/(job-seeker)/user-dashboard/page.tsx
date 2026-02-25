'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { applicationService } from '@/lib/services/application.service';
import { jobService } from '@/lib/services/job.service';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Eye 
} from 'lucide-react';
import { ApplicationStatus, UserRole } from '@/types';

export default function JobSeekerDashboard() {
  const { data: session, status } = useSession();


  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const { data: recommendedJobs } = useQuery({
    queryKey: ['recommended-jobs'],
    queryFn: () => jobService.getJobs({ limit: 5 }),
  });

  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== UserRole.JOB_SEEKER) {
    redirect('/login');
  }
  
  const totalApplications = applications?.data.length || 0;
  const pendingApplications =
    applications?.data.filter((app) => app.status === ApplicationStatus.PENDING)
      .length || 0;
  const shortlistedApplications =
    applications?.data.filter(
      (app) => app.status === ApplicationStatus.SHORTLISTED
    ).length || 0;
  const rejectedApplications =
    applications?.data.filter((app) => app.status === ApplicationStatus.REJECTED)
      .length || 0;

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">Track your job applications and discover new opportunities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Total Applications</p>
              <p className="text-3xl font-bold">{totalApplications}</p>
            </div>
            <Briefcase className="w-12 h-12 text-primary-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold">{pendingApplications}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Shortlisted</p>
              <p className="text-3xl font-bold">{shortlistedApplications}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">Rejected</p>
              <p className="text-3xl font-bold">{rejectedApplications}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-200" />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
              <Link href="/applications">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {applications?.data.slice(0, 5).map((application) => (
                <div
                  key={application._id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {application.job.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.job.company.name || 'Unknown Company'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Applied{' '}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/applications/${application._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {(!applications || applications.data.length === 0) && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No applications yet</p>
                  <Link href="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Completion
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">75% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="w-full">
                Complete Profile
              </Button>
            </Link>
          </Card>

          {/* Recommended Jobs */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommended for You
            </h3>
            <div className="space-y-3">
              {recommendedJobs?.data.slice(0, 3).map((job) => (
                <Link
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 mb-1">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company?.name || 'Unknown Company'}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <span>{job.location.city}</span>
                    <span className="mx-2">•</span>
                    <span>{job.jobType.replace('_', ' ')}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Jobs
              </Button>
            </Link>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Update Resume
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/applications">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Track Applications
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}