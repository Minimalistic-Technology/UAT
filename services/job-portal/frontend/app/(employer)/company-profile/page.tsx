'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { apiClient } from '@/app/lib/api';
import { toast } from 'sonner';
import { UserRole } from '@/app/types';
import { Building, Globe, Linkedin, Twitter, Facebook } from 'lucide-react';

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== UserRole.EMPLOYER) {
    redirect('/login');
  }

  const { data: company } = useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/companies/my-company');
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: company,
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/companies/my-company', data),
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
              <Input
                {...register('location.address')}
                label="Address"
                placeholder="123 Main Street"
                defaultValue={company?.location?.address}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('location.city')}
                  label="City"
                  placeholder="San Francisco"
                  defaultValue={company?.location?.city}
                />
                <Input
                  {...register('location.state')}
                  label="State"
                  placeholder="California"
                  defaultValue={company?.location?.state}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('location.country')}
                  label="Country"
                  placeholder="United States"
                  defaultValue={company?.location?.country}
                />
                <Input
                  {...register('location.zipCode')}
                  label="Zip Code"
                  placeholder="94102"
                  defaultValue={company?.location?.zipCode}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Social Links
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Linkedin className="w-5 h-5 text-gray-400" />
                <Input
                  {...register('socialLinks.linkedin')}
                  placeholder="https://linkedin.com/company/..."
                  defaultValue={company?.socialLinks?.linkedin}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Twitter className="w-5 h-5 text-gray-400" />
                <Input
                  {...register('socialLinks.twitter')}
                  placeholder="https://twitter.com/..."
                  defaultValue={company?.socialLinks?.twitter}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Facebook className="w-5 h-5 text-gray-400" />
                <Input
                  {...register('socialLinks.facebook')}
                  placeholder="https://facebook.com/..."
                  defaultValue={company?.socialLinks?.facebook}
                  className="flex-1"
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