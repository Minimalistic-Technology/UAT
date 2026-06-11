import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CompanyRole } from "@/types";
import { useToggleUserStatus } from "../hooks/use-user";
import { UserWithCompany } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserMinus, UserCheck, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const UserRoleBadge = ({ user }: { user: any }) => {
  const isOwner = user.companyRole === CompanyRole.OWNER;
  const isHR = user.companyRole === CompanyRole.HR;

  if (isOwner)
    return (
      <Badge variant="secondary" className="bg-amber-100/50 text-amber-700 hover:bg-amber-100 uppercase tracking-widest text-[9px] font-bold">
        Owner
      </Badge>
    );
  if (isHR)
    return (
      <Badge variant="secondary" className="bg-pink-100/50 text-pink-700 hover:bg-pink-100 uppercase tracking-widest text-[9px] font-bold">
        HR
      </Badge>
    );

  return (
    <Badge variant="secondary" className="bg-[#2563eb]/10 text-[#2563eb] hover:bg-[#2563eb]/20 uppercase tracking-widest text-[9px] font-bold">
      User
    </Badge>
  );
};

const UserTableRow = ({ user }: { user: UserWithCompany }) => {
  const { mutate: toggleUserStatus, isPending } = useToggleUserStatus();
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {user.avatar?.url ? (
              <AvatarImage src={user.avatar.url} alt={user.firstName} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-muted-foreground text-xs md:hidden">
              {user.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground hidden md:table-cell">
        {user.email}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <UserRoleBadge user={user} />
          {user.companyRole === CompanyRole.HR && user.companyName && (
            <p className="text-muted-foreground text-xs font-semibold">
              {user.companyName}
            </p>
          )}
          {user.companyRole === CompanyRole.OWNER && user.companyName && (
            <p className="text-muted-foreground text-xs font-semibold">
              {user.companyName}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center w-8">
          {user.isActive ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {new Date(user.createdAt).toLocaleDateString(undefined, {
          dateStyle: "medium",
        })}
      </TableCell>
      <TableCell className="text-right">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "cursor-pointer rounded-full transition-colors",
                  user.isActive
                    ? "hover:bg-red-100 hover:text-red-700 text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    : "hover:bg-green-100 hover:text-green-700 text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                )}
                disabled={isPending}
                onClick={() =>
                  toggleUserStatus({ userId: user._id })
                }
              >
                {user.isActive ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                <span className="sr-only">{user.isActive ? "Deactivate User" : "Activate User"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center" className="bg-foreground text-background font-semibold">
              <p>{user.isActive ? "Deactivate User" : "Activate User"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
