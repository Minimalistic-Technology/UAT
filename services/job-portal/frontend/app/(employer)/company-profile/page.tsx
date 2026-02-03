'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { apiClient } from '@/app/lib/api';
import { toast } from 'sonner';
import { UserRole } from '@/app/types';
import { Building, PlusCircle } from 'lucide-react';

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>('/companies/me');
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: status === 'authenticated',
    retry: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: company,
  });

  useEffect(() => {
    if (company) {
      reset(company);
    }
  }, [company, reset]);

  const updateCompanyMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/companies/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      toast.success('Company profile updated');
    },
    onError: () => {
      toast.error('Failed to update company profile');
    },
  });

  const onSubmit = (data: any) => {
    updateCompanyMutation.mutate(data);
  };

  if (status === 'loading' || isCompanyLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!session || session.user.role !== UserRole.EMPLOYER) {
    redirect('/login');
  }

  // Show "Create Company" state if no company exists
  if (!company && !isCompanyLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Building className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No company profile</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a company profile to post jobs.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/create-company')}
              className="inline-flex items-center"
            >
              <PlusCircle className="-ml-0.5 mr-2 h-4 w-4" />
              Create Company
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Company Profile
        </h1>
        <p className="text-gray-600">Manage your company information</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                {...register('name')}
                label="Company Name *"
                placeholder="Acme Inc."
                defaultValue={company?.name}
                error={typeof errors.name?.message === 'string' ? errors.name.message : undefined}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us about your company..."
                  defaultValue={company?.description}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('industry')}
                  label="Industry *"
                  placeholder="Technology"
                  defaultValue={company?.industry}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size *
                  </label>
                  <select
                    {...register('companySize')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    defaultValue={company?.companySize}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>

              <Input
                {...register('website')}
                label="Website"
                placeholder="https://example.com"
                defaultValue={company?.website}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('location.city')}
                  label="City"
                  placeholder="San Francisco"
                  defaultValue={company?.location?.city}
                />
                <Input
                  {...register('location.country')}
                  label="Country"
                  placeholder="United States"
                  defaultValue={company?.location?.country}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              loading={updateCompanyMutation.isPending}
              disabled={updateCompanyMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}