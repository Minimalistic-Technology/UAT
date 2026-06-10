"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, MapPin, Phone, Mail, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserPersonalInfoProps {
    user: any;
}

export function UserPersonalInfo({ user }: UserPersonalInfoProps) {
    if (!user) return null;

    return (
        <div className="space-y-6">
            <Card className="border-secondary/20 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <Mail className="w-4 h-4" /> Email Address
                            </span>
                            <p className="text-sm font-medium">{user.email || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <Phone className="w-4 h-4" /> Phone Number
                            </span>
                            <p className="text-sm font-medium">{user.phone || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" /> Location
                            </span>
                            <p className="text-sm font-medium">
                                {[user.location?.city, user.location?.state, user.location?.country]
                                    .filter(Boolean)
                                    .join(", ") || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <span className="text-sm font-medium text-muted-foreground block">Key Skills</span>
                        <div className="flex flex-wrap gap-2">
                            {user.skills?.length > 0 ? (
                                user.skills.map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20">
                                        {skill}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-slate-500">No skills added yet.</span>
                            )}
                        </div>
                    </div>

                    {user.resume?.url && (
                        <div className="space-y-3 pt-4 border-t">
                            <span className="text-sm font-medium text-muted-foreground block">Resume</span>
                            <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{user.resumeOriginalName || "Resume.pdf"}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                    <a href={user.resume.url} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4 mr-2" /> Download
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-secondary/20 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" /> Experience
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {user.experience?.length > 0 ? (
                        user.experience.map((exp: any, index: number) => (
                            <div key={index} className="flex gap-4 relative">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary z-10" />
                                    {index !== user.experience.length - 1 && <div className="flex-1 w-px bg-border my-1" />}
                                </div>
                                <div className="space-y-1 pb-6 w-full">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                                        <Badge variant="outline" className="text-xs font-normal bg-slate-50">
                                            {exp.startDate ? new Date(exp.startDate).getFullYear() : 'Past'} - {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-primary">{exp.company}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        {exp.location && <><MapPin className="w-3 h-3" /> {exp.location}</>}
                                        {exp.workType && <span className="ml-2 capitalize border-l pl-2 border-border">{exp.workType}</span>}
                                    </p>
                                    {exp.description && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{exp.description}</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed rounded-xl bg-slate-50 text-slate-500 text-sm">
                            No experience added yet.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-secondary/20 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" /> Education
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {user.education?.length > 0 ? (
                        user.education.map((edu: any, index: number) => (
                            <div key={index} className="flex gap-4 relative">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary z-10" />
                                    {index !== user.education.length - 1 && <div className="flex-1 w-px bg-border my-1" />}
                                </div>
                                <div className="space-y-1 pb-6 w-full">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-bold text-slate-900">{edu.degree}</h4>
                                        <Badge variant="outline" className="text-xs font-normal bg-slate-50">
                                            {edu.startDate ? new Date(edu.startDate).getFullYear() : 'Past'} - {edu.current ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-primary">{edu.institution}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Field of Study: {edu.fieldOfStudy}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed rounded-xl bg-slate-50 text-slate-500 text-sm">
                            No education details added yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
