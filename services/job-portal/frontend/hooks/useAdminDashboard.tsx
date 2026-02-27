import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface StatsResponse {
  data: {
    totalUsers: number;
    totalJobs: number;
    totalCompanies: number;
  },
  success: boolean;
}

export function useAdminDashboard(enabled: boolean) {
  const queryClient = useQueryClient();

  const stats = useQuery<StatsResponse>({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats'),
    enabled,
  });

  const pendingJobs = useQuery({
    queryKey: ['admin-pending-jobs'],
    queryFn: () => apiClient.get('/admin/jobs?status=pending'),
    enabled,
  });

  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get('/admin/users'),
    enabled,
  });

  const approveJob = useMutation({
    mutationFn: (jobId: string) =>
      apiClient.put(`/admin/jobs/${jobId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      toast.success('Job approved successfully');
    },
  });

  const rejectJob = useMutation({
    mutationFn: (jobId: string) =>
      apiClient.put(`/admin/jobs/${jobId}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-jobs'] });
      toast.success('Job rejected');
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: ({ userId, isActive }: any) =>
      apiClient.put(`/admin/users/${userId}/toggle-status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
  });

  return {
    stats,
    pendingJobs,
    users,
    approveJob,
    rejectJob,
    toggleUserStatus,
  };
}