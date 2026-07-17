import { GraduationCap } from "lucide-react";
import { User } from "@/types";
import { ProfileSectionCard } from "./profile-section-card";

interface EducationSectionProps {
  user: User | undefined;
}

export const EducationSection = ({ user }: EducationSectionProps) => {
  return (
    <ProfileSectionCard icon={GraduationCap} title="Education">
      {user?.educations && user.educations.length > 0 ? (
        <div className="space-y-6">
          {user.educations.map((edu: any, index: number) => (
            <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold">
                    {edu.degree} in {edu.fieldOfStudy}
                  </h4>
                  <p className="text-sm font-medium">{edu.institution}</p>
                </div>
                <div className="text-muted-foreground text-right text-sm whitespace-nowrap">
                  Class of {edu.graduationYear}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No education added yet.</p>
      )}
    </ProfileSectionCard>
  );
};
