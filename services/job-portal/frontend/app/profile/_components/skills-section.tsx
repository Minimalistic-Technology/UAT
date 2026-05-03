import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { User } from "@/types";
import { ProfileSectionCard } from "./profile-section-card";

interface SkillsSectionProps {
  user: User | undefined;
}

export const SkillsSection = ({ user }: SkillsSectionProps) => {
  return (
    <ProfileSectionCard icon={Wrench} title="Skills">
      {user?.skills && user.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {user.skills.map((skill: string, index: number) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 text-sm"
            >
              {skill}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No skills added yet.</p>
      )}
    </ProfileSectionCard>
  );
};
