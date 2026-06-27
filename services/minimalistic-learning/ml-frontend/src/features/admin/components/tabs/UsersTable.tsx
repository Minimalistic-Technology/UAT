import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
}

interface UsersTableProps {
  users: UserData[];
  handleRoleChange: (userId: string, role: string) => void;
  handleDeleteUser: (userId: string) => void;
}

export const UsersTable = ({
  users,
  handleRoleChange,
  handleDeleteUser,
}: UsersTableProps) => {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-theme-accent/10 bg-theme-element-sec/20 text-foreground/60 border-b text-xs font-black tracking-wider uppercase">
          <th className="px-6 py-4">Name</th>
          <th className="px-6 py-4">Email Address</th>
          <th className="px-6 py-4">User Role</th>
          <th className="px-6 py-4 text-center">Auth Status</th>
          <th className="px-6 py-4 text-right">Settings</th>
        </tr>
      </thead>
      <tbody className="divide-theme-accent/5 divide-y">
        {!users || users.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              className="text-foreground/50 py-12 text-center text-sm font-semibold"
            >
              No user accounts registered.
            </td>
          </tr>
        ) : (
          users.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-theme-element-sec/20 text-foreground/80 text-sm font-semibold transition-colors"
            >
              <td className="px-6 py-4">
                {item.firstName} {item.lastName}
              </td>
              <td className="px-6 py-4 font-mono text-xs">{item.email}</td>
              <td className="px-6 py-4">
                <select
                  value={item.role}
                  onChange={(e) => handleRoleChange(item.id, e.target.value)}
                  className="bg-theme-element-sec border-theme-accent/25 text-foreground focus:border-theme-action rounded-lg border px-2.5 py-1.5 text-xs font-black tracking-wider uppercase focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${item.isVerified ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"}`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${item.isVerified ? "bg-green-500" : "bg-orange-500"}`}
                  />
                  {item.isVerified ? "Verified" : "Pending"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  variant="none"
                  size="none"
                  onClick={() => handleDeleteUser(item.id)}
                  className="bg-theme-element text-foreground/45 border-theme-accent/20 rounded-xl border p-2.5 shadow-sm transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
                  title="Delete User Account"
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
