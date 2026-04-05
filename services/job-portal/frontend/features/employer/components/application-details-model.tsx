import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import { ApplicationWithUser } from "../services/job-application.service";
import { Badge } from "@/components/ui/badge";

export const ApplicationDetailModal = ({ application }: { application: ApplicationWithUser }) => {
  const { jobSeeker } = application;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Candidate Profile</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="pr-4 mt-4">
          <div className="space-y-6 pb-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Contact Information</h3>
                <p className="text-lg font-bold">{jobSeeker.firstName} {jobSeeker.lastName}</p>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Mail className="h-3 w-3" /> {jobSeeker.email}
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <Phone className="h-3 w-3" /> {jobSeeker.phone}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">Skills</h3>
                <div className="flex flex-wrap gap-1 justify-end mt-2">
                  {jobSeeker.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Experience */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                Professional Experience
              </h3>
              <div className="space-y-4">
                {jobSeeker.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-slate-200 pl-4 py-1">
                    <p className="font-bold">{exp.title}</p>
                    <p className="text-sm text-muted-foreground">{exp.company} • {exp.location}</p>
                    <p className="text-xs text-muted-foreground italic">
                      {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                    </p>
                    <p className="text-sm mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Education */}
            <div>
              <h3 className="text-lg font-bold mb-3">Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobSeeker.education.map((edu, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border">
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-sm">{edu.fieldOfStudy}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs font-medium mt-1">Class of {edu.graduationYear}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};