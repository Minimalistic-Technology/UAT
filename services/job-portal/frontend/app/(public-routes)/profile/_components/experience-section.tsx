import { Briefcase, MapPin } from "lucide-react";
import { User } from "@/types";
import { ProfileSectionCard } from "./profile-section-card";

interface ExperienceSectionProps {
  user: User | undefined;
}

const formatWorkType = (type?: string) => {
  if (!type) return null;
  const map: Record<string, string> = {
    wfo: "WFO",
    hybrid: "Hybrid",
    remote: "Remote",
    temporary_wfh: "Temporary WFH",
  };
  return map[type] || type;
};

export const ExperienceSection = ({ user }: ExperienceSectionProps) => {
  return (
    <ProfileSectionCard icon={Briefcase} title="Experience">
      {user?.experience && user.experience.length > 0 ? (
        <div className="space-y-6">
          {user.experience.map((exp: any, index: number) => (
            <div
              key={index}
              className="border-b last:border-0 pb-6 last:pb-0"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xl font-semibold">{exp.title}</h4>
                    <p className="text-sm font-medium">{exp.company}</p>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                    {exp.workType && (
                      <span className="bg-muted text-foreground px-2 py-0.5 rounded-md text-xs font-medium">
                        {formatWorkType(exp.workType)}
                      </span>
                    )}
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {exp.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(exp.startDate).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {exp.current
                    ? "Present"
                    : exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </div>
              </div>
              {exp.description && (
                <p className="text-sm mt-3 text-foreground/80 leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No experience added yet.
        </p>
      )}
    </ProfileSectionCard>
  );
};
