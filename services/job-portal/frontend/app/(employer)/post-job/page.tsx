'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { jobService } from '@/lib/services/job.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { toast } from 'sonner';
import { JobType, ExperienceLevel } from '@/types';

const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  jobType: z.nativeEnum(JobType),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  locationCity: z.string().min(2, 'City is required'),
  locationCountry: z.string().min(2, 'Country is required'),
  remote: z.boolean(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().default('USD'),
  salaryPeriod: z.enum(['hourly', 'monthly', 'yearly']).default('yearly'),
  skills: z.string(),
  requirements: z.string(),
  benefits: z.string().optional(),
  openings: z.number().min(1).default(1),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      remote: false,
      salaryCurrency: 'USD',
      salaryPeriod: 'yearly',
      openings: 1,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: (data: any) => jobService.createJob(data),
    onSuccess: () => {
      toast.success('Job posted successfully!');
      router.push('/employer-dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to post job');
    },
  });

  const onSubmit = async (data: JobFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const jobData = {
        title: data.title,
        description: data.description,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
        location: {
          city: data.locationCity,
          country: data.locationCountry,
          remote: data.remote,
        },
        salary: {
          min: data.salaryMin,
          max: data.salaryMax,
          currency: data.salaryCurrency,
          period: data.salaryPeriod,
        },
        skills: data.skills.split(',').map((s) => s.trim()),
        requirements: data.requirements.split('\n').filter((r) => r.trim()),
        benefits: data.benefits?.split('\n').filter((b) => b.trim()),
        openings: data.openings,
      };

      await createJobMutation.mutateAsync(jobData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Post a New Job</h1>
        <p className="text-gray-600">Fill in the details to create a job posting</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                {...register('title')}
                label="Job Title *"
                placeholder="e.g., Senior Software Engineer"
                error={errors.title?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type *
                  </label>
                  <select
                    {...register('jobType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.values(JobType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level *
                  </label>
                  <select
                    {...register('experienceLevel')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.values(ExperienceLevel).map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('locationCity')}
                  label="City *"
                  placeholder="e.g., San Francisco"
                  error={errors.locationCity?.message}
                />
                <Input
                  {...register('locationCountry')}
                  label="Country *"
                  placeholder="e.g., United States"
                  error={errors.locationCountry?.message}
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register('remote')}
                  type="checkbox"
                  id="remote"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
                  This is a remote position
                </label>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Salary Range (Optional)
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Input
                {...register('salaryMin', { valueAsNumber: true })}
                type="number"
                label="Minimum"
                placeholder="50000"
              />
              <Input
                {...register('salaryMax', { valueAsNumber: true })}
                type="number"
                label="Maximum"
                placeholder="80000"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  {...register('salaryCurrency')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  {...register('salaryPeriod')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Skills & Requirements
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills * (comma separated)
                </label>
                <input
                  {...register('skills')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., React, Node.js, TypeScript"
                />
                {errors.skills && (
                  <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements * (one per line)
                </label>
                <textarea
                  {...register('requirements')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g.,&#10;5+ years of experience&#10;Bachelor's degree in CS&#10;Strong problem-solving skills"
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.requirements.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits (one per line, optional)
                </label>
                <textarea
                  {...register('benefits')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g.,&#10;Health insurance&#10;401(k) matching&#10;Flexible hours"
                />
              </div>

              <Input
                {...register('openings', { valueAsNumber: true })}
                type="number"
                label="Number of Openings *"
                placeholder="1"
                min={1}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              Post Job
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}