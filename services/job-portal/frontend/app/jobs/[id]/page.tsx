'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { jobService } from '@/app/lib/services/job.service';
import { applicationService } from '@/app/lib/services/application.service';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { toast } from 'sonner';
import { UserRole } from '@/app/types';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  Users,
  Calendar,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['job', params.id],
    queryFn: () => jobService.getJob(params.id),
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: string) =>
      applicationService.applyForJob({ jobId }),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      router.push('/applications');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    },
  });

  const handleApply = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/jobs/${params.id}`);
      return;
    }

    if (session.user.role !== UserRole.JOB_SEEKER) {
      toast.error('Only job seekers can apply for jobs');
      return;
    }

    applyMutation.mutate(params.id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const job = data?.data;

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <p className="text-gray-600">Job not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {job.company.logo && (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-xl text-gray-600">{job.company.name}</p>
                </div>
              </div>
              {job.isFeatured && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                  Featured
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                {job.location.remote
                  ? 'Remote'
                  : `${job.location.city}, ${job.location.country}`}
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="w-5 h-5 mr-2" />
                {job.jobType.replace('_', ' ')}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
              </div>
              {job.salary.min && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {job.salary.min.toLocaleString()} - {job.salary.max?.toLocaleString()} / {job.salary.period}
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </div>
              {job.applicationDeadline && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  Deadline: {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none text-gray-700">
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </Card>

          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <Button
              onClick={handleApply}
              className="w-full mb-4"
              size="lg"
              loading={applyMutation.isPending}
              disabled={applyMutation.isPending}
            >
              Apply Now
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>{job.applicationsCount} applicants</p>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About {job.company.name}
            </h3>
            {job.company.logo && (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <p className="text-gray-700 mb-4">{job.company.description}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                {job.company.industry}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {job.company.companySize} employees
              </div>
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}