"use client";

import React, { useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersTable, UserData } from "./UsersTable";

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
          <UsersTable
            users={users}
            handleRoleChange={handleRoleChange}
            handleDeleteUser={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
}
