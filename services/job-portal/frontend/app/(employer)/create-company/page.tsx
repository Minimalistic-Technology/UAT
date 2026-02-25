'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { companyService, CreateCompanyData } from '@/lib/services/company.service';
import { Building, MapPin, Globe } from 'lucide-react';

export default function CreateCompanyPage() {
    const router = useRouter();
    const queryClient = useQueryClient();


    const { data: existingCompany, isLoading: isCheckingCompany } = useQuery({
        queryKey: ['company-profile'],
        queryFn: async () => {
            try {
                const response = await companyService.getMyCompany();
                return response.data;
            } catch (err: any) {
                if (err.response?.status === 404) return null;
                return null;
            }
        },
        retry: false,
    });

    useEffect(() => {
        if (existingCompany) {
            router.push('/company-profile');
        }
    }, [existingCompany, router]);

    if (existingCompany) return null;

    if (isCheckingCompany) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateCompanyData>();

    const createCompanyMutation = useMutation({
        mutationFn: (data: CreateCompanyData) => companyService.createCompany(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['company-profile'] });
            queryClient.setQueryData(['company-profile'], response.data);

            toast.success('Company created successfully!');
            router.push('/company-profile');
        },
        onError: (error: AxiosError<any>) => {
            const message = error.response?.data?.message || (error as Error).message || 'Failed to create company';
            toast.error(message);
        },
    });

    const onSubmit = (data: CreateCompanyData) => {
        createCompanyMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Create Your Company
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Start by setting up your company profile to post jobs.
                    </p>
                </div>

                <Card className="p-8 shadow-xl border-t-4 border-primary-600">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Step 1: Basic Info */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 border-b pb-2">
                                <Building className="w-6 h-6 text-primary-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="col-span-2">
                                    <Input
                                        {...register('name', { required: 'Company name is required' })}
                                        label="Company Name *"
                                        placeholder="e.g. Acme Inc."
                                        error={errors.name?.message}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        {...register('description', { required: 'Description is required' })}
                                        rows={4}
                                        className={`w-full px-4 py-3 rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            } focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                                        placeholder="Tell us about your company culture, mission, and what you do..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                                    )}
                                </div>

                                <Input
                                    {...register('industry', { required: 'Industry is required' })}
                                    label="Industry *"
                                    placeholder="e.g. Technology"
                                    error={errors.industry?.message}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Size *
                                    </label>
                                    <select
                                        {...register('companySize', { required: 'Company size is required' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 bg-white"
                                    >
                                        <option value="">Select size</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="501-1000">501-1000 employees</option>
                                        <option value="1000+">1000+ employees</option>
                                    </select>
                                    {errors.companySize && (
                                        <p className="mt-1 text-sm text-red-600">{errors.companySize.message}</p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Input
                                        {...register('website')}
                                        label="Website"
                                        placeholder="https://example.com"
                                        icon={<Globe className="w-5 h-5 text-gray-400" />}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Location */}
                        <div className="space-y-6 pt-6">
                            <div className="flex items-center space-x-2 border-b pb-2">
                                <MapPin className="w-6 h-6 text-primary-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Primary Location</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Input
                                    {...register('location.city', { required: 'City is required' })}
                                    label="City *"
                                    placeholder="San Francisco"
                                    error={errors.location?.city?.message}
                                />

                                <Input
                                    {...register('location.country', { required: 'Country is required' })}
                                    label="Country *"
                                    placeholder="USA"
                                    error={errors.location?.country?.message}
                                />
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full md:w-auto px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                loading={createCompanyMutation.isPending}
                                disabled={createCompanyMutation.isPending}
                            >
                                Create Company
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
