import { GraduationCap } from "lucide-react";
import { User } from "@/types";
import { ProfileSectionCard } from "./profile-section-card";

interface EducationSectionProps {
  user: User | undefined;
}

export const EducationSection = ({ user }: EducationSectionProps) => {
  return (
    <ProfileSectionCard icon={GraduationCap} title="Education">
      {user?.education && user.education.length > 0 ? (
        <div className="space-y-6">
          {user.education.map((edu: any, index: number) => (
            <div
              key={index}
              className="border-b last:border-0 pb-6 last:pb-0"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-bold text-base">
                    {edu.degree} in {edu.fieldOfStudy}
                  </h4>
                  <p className="text-sm font-medium">{edu.institution}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                  Class of {edu.graduationYear}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No education added yet.
        </p>
      )}
    </ProfileSectionCard>
  );
};
