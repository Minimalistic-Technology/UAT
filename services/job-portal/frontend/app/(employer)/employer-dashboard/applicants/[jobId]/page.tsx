'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/app/lib/services/application.service';
import { jobService } from '@/app/lib/services/job.service';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { ApplicationStatus } from '@/app/types';
import { toast } from 'sonner';
import { Download, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';

export default function ApplicantsPage({ params }: { params: { jobId: string } }) {
  const queryClient = useQueryClient();

  const { data: job } = useQuery({
    queryKey: ['job', params.jobId],
    queryFn: () => jobService.getJob(params.jobId),
  });

  const { data: applicants, isLoading } = useQuery({
    queryKey: ['applicants', params.jobId],
    queryFn: () => applicationService.getJobApplicants(params.jobId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
      note,
    }: {
      applicationId: string;
      status: string;
      note?: string;
    }) => applicationService.updateApplicationStatus(applicationId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', params.jobId] });
      toast.success('Application status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleStatusChange = (applicationId: string, status: string) => {
    if (window.confirm(`Are you sure you want to ${status} this application?`)) {
      updateStatusMutation.mutate({ applicationId, status });
    }
  };

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Applicants for {job?.data.title}
        </h1>
        <p className="text-gray-600">
          {applicants?.data.length || 0} total applications
        </p>
      </div>

      <div className="space-y-6">
        {applicants?.data.map((application) => (
          <Card key={application._id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xl font-bold">
                    {application.jobSeeker.firstName[0]}
                    {application.jobSeeker.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {application.jobSeeker.firstName}{' '}
                      {application.jobSeeker.lastName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {application.jobSeeker.email}
                      </div>
                      {application.jobSeeker.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {application.jobSeeker.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {application.jobSeeker.skills && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.jobSeeker.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {application.jobSeeker.experience &&
                  application.jobSeeker.experience.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Recent Experience
                      </h4>
                      <div className="space-y-2">
                        {application.jobSeeker.experience.slice(0, 2).map((exp, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium text-gray-900">{exp.title}</p>
                            <p className="text-gray-600">
                              {exp.company} • {exp.location}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Cover Letter
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {application.coverLetter}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Applied {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                  {application.resume && (
                    <a
                      href={application.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Resume
                    </a>
                  )}
                </div>
              </div>

              <div className="ml-6 space-y-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status.replace('_', ' ')}
                </span>

                <div className="space-y-2">
                  {application.status === ApplicationStatus.PENDING && (
                    <>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          handleStatusChange(
                            application._id,
                            ApplicationStatus.SHORTLISTED
                          )
                        }
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          handleStatusChange(
                            application._id,
                            ApplicationStatus.REVIEWED
                          )
                        }
                      >
                        Mark Reviewed
                      </Button>
                    </>
                  )}

                  {application.status === ApplicationStatus.SHORTLISTED && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        handleStatusChange(
                          application._id,
                          ApplicationStatus.INTERVIEW
                        )
                      }
                    >
                      Schedule Interview
                    </Button>
                  )}

                  {application.status !== ApplicationStatus.REJECTED &&
                    application.status !== ApplicationStatus.WITHDRAWN && (
                      <Button
                        size="sm"
                        variant="danger"
                        className="w-full"
                        onClick={() =>
                          handleStatusChange(
                            application._id,
                            ApplicationStatus.REJECTED
                          )
                        }
                      >
                        Reject
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {applicants?.data.length === 0 && (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}