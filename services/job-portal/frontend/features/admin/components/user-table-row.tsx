import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CompanyRole } from "@/types";
import { useToggleUserStatus } from "../hooks/use-user";

const UserRoleBadge = ({ user }: { user: any }) => {
  const isOwner = user.companyRole === CompanyRole.OWNER;
  const isAdmin = user.companyRole === CompanyRole.ADMIN;

  if (isOwner)
    return (
      <Badge
        variant="outline"
        className="border-amber-200 bg-amber-50 text-amber-700"
      >
        Owner
      </Badge>
    );
  if (isAdmin) return <Badge variant="secondary">Admin</Badge>;

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
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
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
        <UserRoleBadge user={user} />
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
