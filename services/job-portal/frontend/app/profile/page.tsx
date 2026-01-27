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
import { Camera, Plus, Trash2, Briefcase, GraduationCap } from 'lucide-react';
import { UserRole } from '@/app/types';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/auth/me');
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: profile,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/users/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar updated successfully');
      setSelectedFile(null);
    },
    onError: () => {
      toast.error('Failed to upload avatar');
    },
  });

  // Upload resume mutation
  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      return apiClient.put('/users/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Resume uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload resume');
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      uploadResumeMutation.mutate(file);
    }
  };

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      {/* Avatar Section */}
      <Card className="mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-600">
                  {profile?.firstName?.[0]}
                  {profile?.lastName?.[0]}
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700"
            >
              <Camera className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {profile?.firstName} {profile?.lastName}
            </h3>
            <p className="text-gray-600">{profile?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Basic Information
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              {...register('firstName')}
              label="First Name"
              defaultValue={profile?.firstName}
            />
            <Input
              {...register('lastName')}
              label="Last Name"
              defaultValue={profile?.lastName}
            />
          </div>

          <Input
            {...register('email')}
            type="email"
            label="Email"
            defaultValue={profile?.email}
            disabled
          />

          <Input
            {...register('phone')}
            type="tel"
            label="Phone Number"
            defaultValue={profile?.phone}
          />

          {session.user.role === UserRole.JOB_SEEKER && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  {...register('location.city')}
                  label="City"
                  defaultValue={profile?.location?.city}
                />
                <Input
                  {...register('location.state')}
                  label="State"
                  defaultValue={profile?.location?.state}
                />
                <Input
                  {...register('location.country')}
                  label="Country"
                  defaultValue={profile?.location?.country}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  {...register('skills')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="React, Node.js, TypeScript"
                  defaultValue={profile?.skills?.join(', ')}
                />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={updateProfileMutation.isPending}
              disabled={updateProfileMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Resume Upload (Job Seeker Only) */}
      {session.user.role === UserRole.JOB_SEEKER && (
        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume</h2>
          <div className="space-y-4">
            {profile?.resume ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Current Resume
                    </p>
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View Resume
                    </a>
                  </div>
                </div>
                <label htmlFor="resume-upload">
                  <Button variant="outline" size="sm" type="button">
                    Update Resume
                  </Button>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeChange}
                  />
                </label>
              </div>
            ) : (
              <label
                htmlFor="resume-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary-500"
              >
                <Briefcase className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Upload your resume</p>
                <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeChange}
                />
              </label>
            )}
          </div>
        </Card>
      )}

      {/* Experience Section (Job Seeker Only) */}
      {session.user.role === UserRole.JOB_SEEKER && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
            <Button
              size="sm"
              onClick={() => setEditingExperience(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>

          <div className="space-y-4">
            {profile?.experience?.map((exp: any, index: number) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.title}
                    </h3>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {exp.location} • {new Date(exp.startDate).toLocaleDateString()} -{' '}
                      {exp.current
                        ? 'Present'
                        : new Date(exp.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}

            {(!profile?.experience || profile.experience.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No experience added yet</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Education Section (Job Seeker Only) */}
      {session.user.role === UserRole.JOB_SEEKER && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Education</h2>
            <Button
              size="sm"
              onClick={() => setEditingEducation(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>

          <div className="space-y-4">
            {profile?.education?.map((edu: any, index: number) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {edu.degree}
                    </h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {edu.fieldOfStudy} • Graduated {edu.graduationYear}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}

            {(!profile?.education || profile.education.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No education added yet</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}