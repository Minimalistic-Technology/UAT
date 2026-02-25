import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface EducationFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const EducationForm: React.FC<EducationFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData || {
            graduationYear: new Date().getFullYear(),
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    {...register('degree', { required: 'Degree is required' })}
                    label="Degree"
                    error={errors.degree?.message as string}
                />
                <Input
                    {...register('institution', { required: 'Institution is required' })}
                    label="Institution"
                    error={errors.institution?.message as string}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    {...register('fieldOfStudy', { required: 'Field of Study is required' })}
                    label="Field of Study"
                    error={errors.fieldOfStudy?.message as string}
                />
                <Input
                    {...register('graduationYear', {
                        required: 'Graduation Year is required',
                        min: { value: 1900, message: 'Invalid year' },
                        max: { value: new Date().getFullYear() + 10, message: 'Invalid year' }
                    })}
                    type="number"
                    label="Graduation Year"
                    error={errors.graduationYear?.message as string}
                />
            </div>

            <div className="flex justify-end space-x-3">
                <Button variant="ghost" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button type="submit" loading={isLoading}>
                    Save Education
                </Button>
            </div>
        </form>
    );
};
