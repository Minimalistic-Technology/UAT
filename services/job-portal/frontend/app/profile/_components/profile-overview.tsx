import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, UserPlus, Upload, MapPin, CalendarDays } from "lucide-react";
import { User } from "@/types";
import { Session } from "next-auth";

interface ProfileOverviewProps {
  user: User | undefined;
  session: Session | null;
  initials: string;
  isAvatarUploading: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ProfileOverview = ({
  user,
  session,
  initials,
  isAvatarUploading,
  avatarInputRef,
}: ProfileOverviewProps) => {
  return (
    <div className="space-y-6 lg:col-span-1">
      <Card className="border shadow-sm">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="border-background h-28 w-28 border-4 shadow-xl">
                {user?.avatar ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                ) : null}
                <AvatarFallback className="bg-muted text-primary text-4xl font-extrabold opacity-70">
                  {isAvatarUploading ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : (
                    initials || <UserPlus className="h-10 w-10" />
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Upload Avatar FAB */}
              <Button
                size="sm"
                variant="secondary"
                className="border-primary/20 absolute right-1 -bottom-1 h-8 w-8 rounded-full border p-0 shadow-lg"
                title="Upload Profile Picture"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isAvatarUploading}
              >
                {isAvatarUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold tracking-tight">
                {session?.user?.name ?? `${user?.firstName} ${user?.lastName}`}
              </h2>
              <p className="text-muted-foreground font-mono text-sm font-medium lowercase">
                {user?.email ?? "email not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-3">
          <CardTitle className="text-foreground/80 text-sm font-semibold tracking-wide uppercase">
            Quick Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3.5 pt-4">
          <div className="flex items-center gap-3.5 text-sm">
            <MapPin className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground font-medium">Location</span>
            <span className="text-foreground ml-auto text-right font-semibold">
              {user?.location
                ? [user.location.city, user.location.state, user.location.country]
                    .filter(Boolean)
                    .join(", ") || "Not Specified"
                : "Not Specified"}
            </span>
          </div>
          <Separator />
          <div className="flex items-center gap-3.5 text-sm">
            <CalendarDays className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground font-medium">Joined</span>
            <span className="text-foreground ml-auto text-right font-semibold tabular-nums">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
