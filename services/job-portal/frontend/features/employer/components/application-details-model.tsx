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
  Wrench 
} from "lucide-react";
import { getInlineUrl } from "@/app/user-dashboard/applications/[applicationId]/page";

export const ApplicationDetailModal = ({ application }: { application: any }) => {
  const { jobSeeker, resume } = application;
  const resumeLinkToShow = getInlineUrl(resume);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-sm">
          View Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl w-[95vw] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Candidate Profile
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Reviewing application for {jobSeeker.firstName} {jobSeeker.lastName}
              </p>
            </div>
            {resume && (
              <Button size="sm" variant="secondary" asChild className="gap-2">
                <a href={resumeLinkToShow} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> 
                  View Resume
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {/* Fixed Height Scroll Area prevents layout jumping */}
        <ScrollArea className="h-[70vh] px-6">
          <div className="py-6 space-y-8">
            
            {/* Header Section: Bio & Skills */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold uppercase text-xs tracking-wider">
                  <User className="h-4 w-4" />
                  Contact Information
                </div>
                <div className="grid gap-2">
                  <h2 className="text-xl font-bold">{jobSeeker.firstName} {jobSeeker.lastName}</h2>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" /> {jobSeeker.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" /> {jobSeeker.phone}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold uppercase text-xs tracking-wider md:justify-end">
                  <Wrench className="h-4 w-4" />
                  Core Skills
                </div>
                <div className="flex flex-wrap gap-1.5 md:justify-end">
                  {jobSeeker.skills?.length > 0 ? (
                    jobSeeker.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No skills listed</span>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Experience Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold uppercase text-xs tracking-wider">
                <Briefcase className="h-4 w-4" />
                Professional Experience
              </div>
              <div className="space-y-4">
                {jobSeeker.experience?.length > 0 ? (
                  jobSeeker.experience.map((exp: any, i: number) => (
                    <Card key={i} className="border-l-4 border-l-primary shadow-none bg-muted/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-base">{exp.title}</h4>
                            <p className="text-sm font-medium text-muted-foreground">{exp.company} • {exp.location}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {exp.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No experience provided.</p>
                )}
              </div>
            </section>

            <Separator />

            {/* Education Section */}
            <section className="space-y-4 pb-4">
              <div className="flex items-center gap-2 text-primary font-semibold uppercase text-xs tracking-wider">
                <GraduationCap className="h-4 w-4" />
                Education
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobSeeker.education?.length > 0 ? (
                  jobSeeker.education.map((edu: any, i: number) => (
                    <div key={i} className="flex flex-col p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                      <span className="text-xs font-bold text-primary mb-1">Class of {edu.graduationYear}</span>
                      <h4 className="font-bold text-sm leading-tight">{edu.degree}</h4>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{edu.fieldOfStudy}</p>
                      <p className="text-xs text-muted-foreground mt-2 border-t pt-2 italic">
                        {edu.institution}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic col-span-2">No education history provided.</p>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
        
        {/* Modal Footer (Standard for Management Dashboards) */}
        <div className="p-4 border-t bg-muted/20 flex justify-end">
            <DialogTrigger asChild>
                <Button variant="ghost">Close Profile</Button>
            </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
};