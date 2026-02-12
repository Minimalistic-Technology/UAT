import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ExperienceFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData || {
            current: false,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    {...register('title', { required: 'Title is required' })}
                    label="Job Title"
                    error={errors.title?.message as string}
                />
                <Input
                    {...register('company', { required: 'Company is required' })}
                    label="Company"
                    error={errors.company?.message as string}
                />
            </div>

            <Input
                {...register('location')}
                label="Location"
            />

            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    {...register('startDate', { required: 'Start Date is required' })}
                    type="date"
                    label="Start Date"
                    error={errors.startDate?.message as string}
                />
                <div className="space-y-2">
                    <Input
                        {...register('endDate')}
                        type="date"
                        label="End Date"
                        disabled={initialData?.current}
                    />
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            {...register('current')}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            I currently work here
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    {...register('description')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                />
            </div>

            <div className="flex justify-end space-x-3">
                <Button variant="ghost" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button type="submit" loading={isLoading}>
                    Save Experience
                </Button>
            </div>
        </form>
    );
};
