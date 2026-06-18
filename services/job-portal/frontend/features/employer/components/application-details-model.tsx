import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
  GraduationCap,
  User,
  Wrench,
} from "lucide-react";
import { getInlineUrl } from "@/utils";
export const ApplicationDetailModal = ({
  application,
}: {
  application: any;
}) => {
  const { jobSeeker, resume } = application;
  const resumeLinkToShow = getInlineUrl(resume);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-sm">
          View Details
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="bg-muted/20 border-b p-4 pb-4 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Candidate Profile
              </DialogTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Reviewing application for {jobSeeker.firstName}{" "}
                {jobSeeker.lastName}
              </p>
            </div>
            {resume && (
              <Button size="sm" variant="secondary" asChild className="gap-2">
                <a
                  href={resumeLinkToShow}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Resume
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Fixed Height Scroll Area prevents layout jumping */}
        <ScrollArea className="h-[70vh] px-4 sm:px-6">
          <div className="space-y-8 py-4 sm:py-6">
            {/* Header Section: Bio & Skills */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-4 md:col-span-2">
                <div className="bg-muted/10 border-border/50 flex items-center gap-4 rounded-2xl border p-5">
                  <div className="bg-primary/10 text-primary ring-background flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold shadow-sm ring-2">
                    {jobSeeker.profilePhoto?.url ? (
                      <img
                        src={jobSeeker.profilePhoto.url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>
                        {jobSeeker.firstName?.charAt(0)}
                        {jobSeeker.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold">
                      {jobSeeker.firstName} {jobSeeker.lastName}
                    </h3>
                    <div className="text-muted-foreground flex flex-col gap-2 text-sm font-medium sm:flex-row sm:gap-4">
                      {jobSeeker.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4" />
                          <span>{jobSeeker.email}</span>
                        </div>
                      )}
                      {jobSeeker.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4" />
                          <span>{jobSeeker.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase md:justify-end">
                  <Wrench className="h-4 w-4" />
                  Core Skills
                </div>
                <div className="flex flex-wrap gap-1.5 md:justify-end">
                  {jobSeeker.skills?.length > 0 ? (
                    jobSeeker.skills.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs italic">
                      No skills listed
                    </span>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Experience Section */}
            <section className="space-y-4">
              <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <Briefcase className="h-4 w-4" />
                Professional Experience
              </div>
              <div className="space-y-4">
                {jobSeeker.experience?.length > 0 ? (
                  jobSeeker.experience.map((exp: any, i: number) => (
                    <Card
                      key={i}
                      className="border-l-primary bg-muted/10 border-l-4 shadow-none"
                    >
                      <CardContent className="p-4">
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="text-base font-bold">{exp.title}</h4>
                            <p className="text-muted-foreground text-sm font-medium">
                              {exp.company} • {exp.location}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {new Date(exp.startDate).toLocaleDateString()} -{" "}
                            {exp.current
                              ? "Present"
                              : exp.endDate
                                ? new Date(exp.endDate).toLocaleDateString()
                                : ""}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {exp.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    No experience provided.
                  </p>
                )}
              </div>
            </section>

            <Separator />

            {/* Education Section */}
            <section className="space-y-4 pb-4">
              <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <GraduationCap className="h-4 w-4" />
                Education
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {jobSeeker.education?.length > 0 ? (
                  jobSeeker.education.map((edu: any, i: number) => (
                    <div
                      key={i}
                      className="bg-card text-card-foreground flex flex-col rounded-xl border p-4 shadow-sm"
                    >
                      <span className="text-primary mb-1 text-xs font-bold">
                        Class of {edu.graduationYear}
                      </span>
                      <h4 className="text-sm leading-tight font-bold">
                        {edu.degree}
                      </h4>
                      <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                        {edu.fieldOfStudy}
                      </p>
                      <p className="text-muted-foreground mt-2 border-t pt-2 text-xs italic">
                        {edu.institution}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2 text-sm italic">
                    No education history provided.
                  </p>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Modal Footer (Standard for Management Dashboards) */}
        <div className="bg-muted/20 flex justify-end border-t p-4">
          <DialogTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              Close Profile
            </Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
};
