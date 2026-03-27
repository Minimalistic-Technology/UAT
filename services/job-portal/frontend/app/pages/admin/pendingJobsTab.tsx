"use client"

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const PendingJobsTab = () => {
  const queryClient = useQueryClient();
  const approveJobMutation = useMutation({
    mutationFn: (jobId: string) =>
      apiClient.put(`/admin/jobs/${jobId}/approve`, {}),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      toast.success("Job approved successfully");
    },
  });

  const rejectJobMutation = useMutation({
    mutationFn: (jobId: string) =>
      apiClient.put(`/admin/jobs/${jobId}/reject`, {}),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      toast.success("Job rejected");
    },
  });

  const pendingJobs = useQuery({
    queryKey: ['admin-pending-jobs'],
    queryFn: () => apiClient.get('/admin/jobs?status=pending'),
  });
  
  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Pending Job Approvals
      </h2>
      <div className="space-y-4">
        {Array.isArray(pendingJobs.data) && pendingJobs?.data?.map((job: any) => (
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
                  {job.company.name} • {job.location.city},{" "}
                  {job.location.country}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {job.jobType.replace("_", " ")}
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

        {(!pendingJobs || (Array.isArray(pendingJobs.data) && pendingJobs.data?.length ) === 0) && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No pending jobs to review</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PendingJobsTab;