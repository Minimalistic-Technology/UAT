'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/api';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, Download, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ApplicantProfilePage({
    params,
}: {
    params: Promise<{ applicantId: string }>;
}) {
    const { applicantId } = React.use(params);
    const router = useRouter();

    const { data: user, isLoading } = useQuery({
        queryKey: ['user', applicantId],
        queryFn: async () => {
            const response = await apiClient.get<any>(`/users/${applicantId}`);
            return response.data;
        },
    });

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Applicant not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applicants
            </Button>

            <Card className="mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-3xl font-bold">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <>
                                    {user.firstName[0]}
                                    {user.lastName[0]}
                                </>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h1>
                            <div className="flex flex-col space-y-1 mt-2 text-gray-600">
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {user.email}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {user.phone}
                                    </div>
                                )}
                                {user.location && (
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {user.location.city}, {user.location.state}, {user.location.country}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {user.resume && (
                        <a
                            href={user.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Resume
                        </a>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Experience */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                            Experience
                        </h2>
                        <div className="space-y-6">
                            {user.experience && user.experience.length > 0 ? (
                                user.experience.map((exp: any, index: number) => (
                                    <div key={index} className="border-l-2 border-primary-200 pl-4 ml-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {exp.title}
                                        </h3>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">{exp.company}</span> • {exp.location}
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                            <Calendar className="w-3 h-3 inline mr-1" />
                                            {new Date(exp.startDate).toLocaleDateString()} -{' '}
                                            {exp.current
                                                ? 'Present'
                                                : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                                        </div>
                                        <p className="text-gray-700">{exp.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No experience listed</p>
                            )}
                        </div>
                    </Card>

                    {/* Education */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                            Education
                        </h2>
                        <div className="space-y-6">
                            {user.education && user.education.length > 0 ? (
                                user.education.map((edu: any, index: number) => (
                                    <div key={index} className="border-l-2 border-primary-200 pl-4 ml-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {edu.degree}
                                        </h3>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">{edu.institution}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {edu.fieldOfStudy} • {edu.graduationYear}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No education listed</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Skills */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {user.skills && user.skills.length > 0 ? (
                                user.skills.map((skill: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No skills listed</p>
                            )}
                        </div>
                    </Card>

                    {/* Languages */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Languages</h2>
                        <div className="flex flex-wrap gap-2">
                            {user.languages && user.languages.length > 0 ? (
                                user.languages.map((language: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                                    >
                                        {language}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No languages listed</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
