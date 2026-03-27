'use client';

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiClient } from "@/lib/api";
import { CompanyRole, UserRole } from "@/types";
import { toast } from "sonner";

const COLUMNS = [
  { key: "name", label: "User" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
  { key: "actions", label: "Actions" },
];

export interface PaginatedUserResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    users: any[];
    pagination: {
      totalPages: number;
      currentPage: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

const badgeStyles = {
  OWNER: "bg-yellow-50 text-yellow-700 border-yellow-200",
  EMPLOYEE: "bg-indigo-50 text-indigo-700 border-indigo-200",
  USER: "bg-purple-50 text-purple-700 border-purple-200",
  INACTIVE: "bg-red-50 text-red-700 border-red-200",
};

const StatusBadge = ({
  role = "user",
  companyRole,
  isActive,
  isEmployee,
}: {
  role?: string;
  companyRole?: string;
  isActive?: boolean;
  isEmployee?: boolean;
}) => {
  // when isEmployee is provided we override the default "role" display
  if (typeof isEmployee === "boolean") {
    // owner should get its own label/style even though it's also an employee
    let label = isEmployee ? "Employee" : "User";
    let style = isEmployee ? badgeStyles.EMPLOYEE : badgeStyles.USER;

    if (companyRole === CompanyRole.OWNER) {
      label = "Owner";
      style = badgeStyles.OWNER;
    }

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
      >
        {label}
      </span>
    );
  }

  // fallback for showing active/inactive status
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isActive
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const UserTableRow = ({ user }: { user: any }) => {
  const queryClient = useQueryClient();

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiClient.put(`/admin/users/${userId}/toggle-status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },
  });

  const isEmployee =
    user.companyRole === CompanyRole.OWNER ||
    user.companyRole === CompanyRole.ADMIN;

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-gray-400 md:hidden">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge
          companyRole={user.companyRole}
          isEmployee={isEmployee}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge isActive={user.isActive} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString(undefined, {
          dateStyle: "medium",
        })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Button
          size="sm"
          variant={user.isActive ? "danger" : "primary"}
          className="w-24 justify-center"
          onClick={() =>
            toggleUserStatusMutation.mutate({
              userId: user._id,
              isActive: !user.isActive,
            })
          }
        >
          {user.isActive ? "Deactivate" : "Activate"}
        </Button>
      </td>
    </tr>
  );
};

const UserManagementTab = () => {
  const {
    data: responseData,
    isLoading,
    isError,
  } = useQuery<PaginatedUserResponse>({
    queryKey: ["admin-users"],
    queryFn: () => apiClient.get("/admin/users"),
  });

  const usersList = responseData?.data?.users || [];

  if (isLoading) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="text-gray-500 font-medium">Fetching users...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-12 text-center border-red-100 bg-red-50/30">
        <p className="text-red-600 font-medium">
          Failed to load user management data.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-500">
          Manage permissions and account statuses for all users.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50/80">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usersList.length > 0 ? (
              usersList.map((user) => (
                <UserTableRow key={user._id} user={user} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No users found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UserManagementTab;
