"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserWithCompany } from "@/features/admin/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CompanyRole } from "@/types";
import { CheckCircle2, XCircle, UserMinus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleUserStatus } from "@/features/admin/hooks/use-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const UserRoleBadge = ({ user }: { user: any }) => {
  const isOwner = user.companyRole === CompanyRole.OWNER;
  const isHR = user.companyRole === CompanyRole.HR;

  if (isOwner)
    return (
      <Badge
        variant="secondary"
        className="bg-amber-100/50 text-[9px] font-bold tracking-widest text-amber-700 uppercase hover:bg-amber-100"
      >
        Owner
      </Badge>
    );
  if (isHR)
    return (
      <Badge
        variant="secondary"
        className="bg-pink-100/50 text-[9px] font-bold tracking-widest text-pink-700 uppercase hover:bg-pink-100"
      >
        HR
      </Badge>
    );

  return (
    <Badge
      variant="secondary"
      className="bg-[#2563eb]/10 text-[9px] font-bold tracking-widest text-[#2563eb] uppercase hover:bg-[#2563eb]/20"
    >
      User
    </Badge>
  );
};

const ActionCell = ({ user }: { user: UserWithCompany }) => {
  const { mutate: toggleUserStatus, isPending } = useToggleUserStatus();

  return (
    <div className="flex justify-end">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "cursor-pointer rounded-full transition-colors",
                user.isActive
                  ? "text-slate-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  : "border border-dashed border-slate-300 text-slate-400 hover:bg-green-100 hover:text-green-700 dark:border-slate-800 dark:hover:bg-green-900/30 dark:hover:text-green-400",
              )}
              disabled={isPending}
              onClick={() => toggleUserStatus({ userId: user.id })}
            >
              {user.isActive ? (
                <UserMinus className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              <span className="sr-only">
                {user.isActive ? "Deactivate User" : "Activate User"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            align="center"
            className="bg-foreground text-background font-semibold"
          >
            <p>{user.isActive ? "Deactivate User" : "Activate User"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const columns: ColumnDef<UserWithCompany>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

      return (
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
      );
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="hidden md:block">Email</div>,
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground hidden md:block">
          {row.original.email}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      return (
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
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className="flex w-8 items-center justify-center">
          {isActive ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "joined",
    header: "Joined",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground tabular-nums">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return <ActionCell user={row.original} />;
    },
  },
];
