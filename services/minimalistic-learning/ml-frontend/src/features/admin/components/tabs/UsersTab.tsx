"use client";

import React, { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
}

export default function UsersTab() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data?.data || [];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      targetRole,
    }: {
      userId: string;
      targetRole: string;
    }) => {
      await api.put(`/admin/users/${userId}`, { role: targetRole });
    },
    onMutate: async ({ userId, targetRole }) => {
      await queryClient.cancelQueries({ queryKey: ["admin_users"] });
      const previousUsers = queryClient.getQueryData<UserData[]>([
        "admin_users",
      ]);
      queryClient.setQueryData<UserData[]>(["admin_users"], (old) =>
        old?.map((u) =>
          u.id === userId ? { ...u, role: targetRole as "user" | "admin" } : u,
        ),
      );
      return { previousUsers };
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(["admin_users"], context?.previousUsers);
      const msg =
        err?.response?.status === 403
          ? "Access Denied: Admin rights required."
          : "Failed to change user role. Network issue.";
      toast.error(msg);
    },
    onSuccess: () => {
      toast.success("User role updated successfully!");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["admin_users"] });
      const previousUsers = queryClient.getQueryData<UserData[]>([
        "admin_users",
      ]);
      queryClient.setQueryData<UserData[]>(["admin_users"], (old) =>
        old?.filter((u) => u.id !== userId),
      );
      return { previousUsers };
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(["admin_users"], context?.previousUsers);
      const msg =
        err.response?.status === 403
          ? "Access Denied."
          : "Failed to delete account.";
      toast.error(err.response?.data?.message || msg);
    },
    onSuccess: () => {
      toast.success("User account removed permanently.");
    },
  });

  const handleRoleChange = useCallback(
    (userId: string, targetRole: string) => {
      updateRoleMutation.mutate({ userId, targetRole });
    },
    [updateRoleMutation],
  );

  const handleDeleteUser = useCallback(
    (userId: string) => {
      if (
        !confirm(
          "De-register this user? This removes all active profiles from DB.",
        )
      )
        return;
      deleteUserMutation.mutate(userId);
    },
    [deleteUserMutation],
  );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative h-10 w-10">
          <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div className="bg-theme-element border-theme-accent/20 overflow-hidden rounded-[2.5rem] border shadow-sm">
        <div className="border-theme-accent/10 bg-theme-element-sec/50 border-b p-8">
          <h3 className="text-foreground text-xl font-black tracking-tight">
            System Users & Access Levels
          </h3>
          <p className="text-foreground/50 text-xs font-bold tracking-widest uppercase">
            Active Accounts Grid
          </p>
        </div>
        <div className="overflow-x-auto">
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
                    <td className="px-6 py-4 font-mono text-xs">
                      {item.email}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.role}
                        onChange={(e) =>
                          handleRoleChange(item.id, e.target.value)
                        }
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
        </div>
      </div>
    </div>
  );
}
