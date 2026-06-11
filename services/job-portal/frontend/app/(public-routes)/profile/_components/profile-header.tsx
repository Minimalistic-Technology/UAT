import { ShieldCheck, Edit2 } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditProfileDialog } from "../edit-profile-dialog";
import { User } from "@/types";

interface ProfileHeaderProps {
  user: User | undefined;
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-4">
      <div className="space-y-1">
        <CardTitle className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <div className="bg-primary/10 rounded-lg p-2">
            <ShieldCheck className="text-primary h-6 w-6" />
          </div>
          My Profile
        </CardTitle>
        <CardDescription className="text-base">
          View and manage your personal and account security settings.
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <EditProfileDialog user={user}>
            <Button variant="outline" className="gap-2 shadow-sm">
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          </EditProfileDialog>
        )}
      </div>
    </div>
  );
};
