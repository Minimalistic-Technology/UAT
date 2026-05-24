import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CompanyRole } from "@/types";
import { useToggleUserStatus } from "../hooks/use-user";

const UserRoleBadge = ({ user }: { user: any }) => {
  const isOwner = user.companyRole === CompanyRole.OWNER;
  const isHR = user.companyRole === CompanyRole.HR;

  if (isOwner)
    return (
      <Badge
        variant="outline"
        className="border-amber-200 bg-amber-50 text-amber-700"
      >
        Owner
      </Badge>
    );
  if (isHR)
    return (
      <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-100">HR</Badge>
    );

  return (
    <Badge
      variant="outline"
      className="border-indigo-200 bg-indigo-50 text-indigo-700"
    >
      User
    </Badge>
  );
};

const UserTableRow = ({ user }: { user: any }) => {
  const { mutate: toggleUserStatus, isPending } = useToggleUserStatus();
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {user.avatar?.url ? (
              <AvatarImage src={user.avatar.url} alt={user.name} />
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
            {user.companyRole === CompanyRole.OWNER && user.companyName && (
              <div className="text-muted-foreground text-xs">
                {user.companyName}
              </div>
            )}
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
        <Badge
          variant={user.isActive ? "default" : "destructive"}
          className="font-medium"
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {new Date(user.createdAt).toLocaleDateString(undefined, {
          dateStyle: "medium",
        })}
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant={user.isActive ? "destructive" : "outline"}
          className="cursor-pointer"
          disabled={isPending}
          onClick={() =>
            toggleUserStatus({ userId: user._id, isActive: !user.isActive })
          }
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
