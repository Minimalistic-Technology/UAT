"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInlineUrl } from "@/utils";

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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                <Mail className="h-4 w-4" /> Email Address
              </span>
              <p className="text-sm font-medium">
                {user.email || "Not provided"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                <Phone className="h-4 w-4" /> Phone Number
              </span>
              <p className="text-sm font-medium">
                {user.phone || "Not provided"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="h-4 w-4" /> Location
              </span>
              <p className="text-sm font-medium">
                {[
                  user.location?.city,
                  user.location?.state,
                  user.location?.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "Not provided"}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <span className="text-muted-foreground block text-sm font-medium">
              Key Skills
            </span>
            <div className="flex flex-wrap gap-2">
              {user.skills?.length > 0 ? (
                user.skills.map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 border"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  No skills added yet.
                </span>
              )}
            </div>
          </div>

          {user.resume?.url && (
            <div className="space-y-3 border-t pt-4">
              <span className="text-muted-foreground block text-sm font-medium">
                Resume
              </span>
              <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border bg-white p-2 shadow-sm">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.resumeOriginalName || "Resume.pdf"}
                    </p>
                    {user.atsScore && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700">ATS Score:</span>
                          <Badge 
                            variant={user.atsScore.overallScore >= 70 ? "default" : user.atsScore.overallScore >= 40 ? "secondary" : "destructive"}
                          >
                            {user.atsScore.overallScore}/100
                          </Badge>
                        </div>
                        {user.atsScore.sectionsMissing && user.atsScore.sectionsMissing.length > 0 && (
                          <p className="text-xs text-orange-600 font-medium">
                            Missing Sections: {user.atsScore.sectionsMissing.join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={getInlineUrl(user.resume.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="mr-2 h-4 w-4" /> View
                    </a>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <a
                      href={user.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="text-primary h-5 w-5" /> Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.experience?.length > 0 ? (
            user.experience.map((exp: any, index: number) => (
              <div key={index} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-primary/20 border-primary z-10 h-3 w-3 rounded-full border-2" />
                  {index !== user.experience.length - 1 && (
                    <div className="bg-border my-1 w-px flex-1" />
                  )}
                </div>
                <div className="w-full space-y-1 pb-6">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      {exp.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-xs font-normal"
                    >
                      {exp.startDate
                        ? new Date(exp.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Past"}{" "}
                      -{" "}
                      {exp.current
                        ? "Present"
                        : exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                    </Badge>
                  </div>
                  <p className="text-primary text-sm font-medium">
                    {exp.company}
                  </p>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    {exp.location && (
                      <>
                        <MapPin className="h-3 w-3" /> {exp.location}
                      </>
                    )}
                    {exp.workType && (
                      <span className="border-border ml-2 border-l pl-2 capitalize">
                        {exp.workType}
                      </span>
                    )}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border-2 border-dashed bg-slate-50 py-6 text-center text-sm text-slate-500">
              No experience added yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="text-primary h-5 w-5" /> Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.education?.length > 0 ? (
            user.education.map((edu: any, index: number) => (
              <div key={index} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-primary/20 border-primary z-10 h-3 w-3 rounded-full border-2" />
                  {index !== user.education.length - 1 && (
                    <div className="bg-border my-1 w-px flex-1" />
                  )}
                </div>
                <div className="w-full space-y-1 pb-6">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      {edu.degree}
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-xs font-normal"
                    >
                      {edu.graduationYear}
                    </Badge>
                  </div>
                  <p className="text-primary text-sm font-medium">
                    {edu.institution}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Field of Study: {edu.fieldOfStudy}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border-2 border-dashed bg-slate-50 py-6 text-center text-sm text-slate-500">
              No education details added yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
