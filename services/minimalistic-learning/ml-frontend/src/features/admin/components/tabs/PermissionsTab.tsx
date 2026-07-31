"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ModernSwitch } from "./ModernSwitch";

export default function PermissionsTab() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPermLoading, setIsNewPermLoading] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newMethod, setNewMethod] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newDescription, setNewDescription] = useState("");
  const [permPage, setPermPage] = useState(1);
  const [permSearch, setPermSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    api
      .get("/admin/permissions")
      .then((res) => {
        if (!isMounted) return;
        setPermissions(res.data.data || []);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        toast.error("Failed to load permissions data");
        setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPermPage(1);
  }, [permSearch]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((perm) => {
      const searchVal = permSearch.toLowerCase().trim();
      if (!searchVal) return true;
      return (
        perm.path.toLowerCase().includes(searchVal) ||
        perm.role.toLowerCase().includes(searchVal) ||
        (perm.description &&
          perm.description.toLowerCase().includes(searchVal)) ||
        (perm.method && perm.method.toLowerCase().includes(searchVal))
      );
    });
  }, [permissions, permSearch]);

  const itemsPerPage = 10;
  const totalPermPages = Math.ceil(filteredPermissions.length / itemsPerPage);
  const displayedPermissions = filteredPermissions.slice(
    (permPage - 1) * itemsPerPage,
    permPage * itemsPerPage,
  );

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath) return toast.error("Rule access path is required");
    setIsNewPermLoading(true);
    try {
      const res = await api.post("/admin/permissions", {
        path: newPath,
        method: newMethod || null,
        role: newRole,
        isActive: true,
        description: newDescription || null,
      });
      toast.success("Rule pattern registered in DB!");
      setPermissions((prev) =>
        [...prev, res.data.data].sort(
          (a: any, b: any) =>
            a.role.localeCompare(b.role) || a.path.localeCompare(b.path),
        ),
      );
      setNewPath("");
      setNewMethod("");
      setNewDescription("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to add rule permission",
      );
    } finally {
      setIsNewPermLoading(false);
    }
  };

  const handleTogglePermission = async (id: string, currentStatus: boolean) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p)),
    );
    toast.success("Permission status changed globally");
    try {
      await api.patch(`/admin/permissions/${id}/toggle`);
    } catch {
      setPermissions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: currentStatus } : p)),
      );
      toast.error("Failed to modify permission state");
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (
      !confirm("Are you sure you want to delete this route permission pattern?")
    )
      return;
    const previousPermissions = permissions;
    setPermissions((prev) => prev.filter((p) => p.id !== id));
    toast.success("Route access pattern removed from DB");
    try {
      await api.delete(`/admin/permissions/${id}`);
    } catch {
      setPermissions(previousPermissions);
      toast.error("Failed to remove permissions path");
    }
  };

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
      <div className="bg-theme-element border-theme-accent/20 rounded-[2rem] border p-6 shadow-sm sm:p-8">
        <h3 className="text-foreground mb-1 flex items-center gap-2 text-xl font-black">
          <Plus size={20} className="text-theme-action" />
          Register Route Access Rule
        </h3>
        <p className="text-foreground/50 mb-6 text-xs font-bold tracking-widest uppercase">
          Database Pattern Creation
        </p>
        <form
          onSubmit={handleAddPermission}
          className="grid grid-cols-1 items-end gap-4 md:grid-cols-12"
        >
          <div className="md:col-span-3">
            <label className="text-foreground/75 mb-2 block text-xs font-black tracking-wider uppercase">
              Route Path (Exact / Template)
            </label>
            <Input
              type="text"
              placeholder="e.g. /api/v1/posts/:blogId"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              className="bg-theme-element-sec border-theme-accent/25 focus:border-theme-action text-foreground placeholder:text-foreground/30 w-full rounded-xl border px-4 py-3 text-sm font-semibold focus:outline-none"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-foreground/75 mb-2 block text-xs font-black tracking-wider uppercase">
              Rule Name / Description
            </label>
            <Input
              type="text"
              placeholder="e.g. Create Blog Post"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="bg-theme-element-sec border-theme-accent/25 focus:border-theme-action text-foreground placeholder:text-foreground/30 w-full rounded-xl border px-4 py-3 text-sm font-semibold focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-foreground/75 mb-2 block text-xs font-black tracking-wider uppercase">
              Method
            </label>
            <select
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              className="bg-theme-element-sec border-theme-accent/25 focus:border-theme-action text-foreground w-full rounded-xl border px-4 py-3 text-sm font-semibold focus:outline-none"
            >
              <option value="">ALL Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-foreground/75 mb-2 block text-xs font-black tracking-wider uppercase">
              Role Class
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="bg-theme-element-sec border-theme-accent/25 focus:border-theme-action text-foreground w-full rounded-xl border px-4 py-3 text-sm font-semibold focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={isNewPermLoading}
              className="bg-theme-action hover:bg-theme-action/90 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-black text-white uppercase shadow-sm transition-all disabled:opacity-50"
            >
              {isNewPermLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Rule
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-theme-element border-theme-accent/20 overflow-hidden rounded-[2.5rem] border shadow-sm">
        <div className="border-theme-accent/10 bg-theme-element-sec/50 flex flex-col justify-between gap-4 border-b p-8 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-foreground text-xl font-black tracking-tight">
              Active Route Permission matrix
            </h3>
            <p className="text-foreground/50 text-xs font-bold tracking-widest uppercase">
              PostgreSQL Real-Time Guard Rules
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search rules path or role..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="bg-theme-element border-theme-accent/20 focus:border-theme-action text-foreground placeholder:text-foreground/45 w-full rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-theme-accent/10 bg-theme-element-sec/20 text-foreground/60 border-b text-xs font-black tracking-wider uppercase">
                <th className="w-24 px-6 py-4">Role</th>
                <th className="px-6 py-4">Allowed Access Rule & Details</th>
                <th className="w-24 px-6 py-4 text-center">Status</th>
                <th className="w-20 px-6 py-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-theme-accent/5 divide-y">
              {displayedPermissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-foreground/50 py-12 text-center text-sm font-semibold"
                  >
                    No custom route permission definitions matching filter.
                  </td>
                </tr>
              ) : (
                displayedPermissions.map((perm) => (
                  <tr
                    key={perm.id}
                    className="hover:bg-theme-element-sec/20 text-foreground/80 text-sm font-semibold transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${perm.role === "admin" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}
                      >
                        <Shield size={12} />
                        {perm.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className="text-foreground text-sm font-bold">
                          {perm.description || "Custom Dynamic Route Access"}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground/50 font-mono text-xs select-all">
                            {perm.path}
                          </span>
                          <span className="bg-theme-element border-theme-accent/10 text-theme-action rounded border px-2 py-0.5 text-[10px] font-black tracking-wider whitespace-nowrap uppercase">
                            {perm.method || "ANY"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <div className="flex justify-center">
                        <ModernSwitch
                          checked={perm.isActive}
                          onChange={() =>
                            handleTogglePermission(perm.id, perm.isActive)
                          }
                          loading={false}
                          colorClass="bg-green-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="none"
                        size="none"
                        onClick={() => handleDeletePermission(perm.id)}
                        className="bg-theme-element text-foreground/45 border-theme-accent/20 rounded-xl border p-2.5 shadow-sm transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
                        title="Delete Permission Rule"
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
        {totalPermPages > 1 && (
          <div className="border-theme-accent/10 bg-theme-element-sec/20 flex flex-wrap items-center justify-between gap-4 border-t p-6">
            <p className="text-foreground/45 text-xs font-bold tracking-widest uppercase">
              Showing {(permPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(permPage * itemsPerPage, filteredPermissions.length)} of{" "}
              {filteredPermissions.length} rules
            </p>
            <div className="flex gap-2">
              <Button
                variant="none"
                disabled={permPage === 1}
                onClick={() => setPermPage((prev) => Math.max(prev - 1, 1))}
                className="bg-theme-element border-theme-accent/20 text-foreground hover:bg-theme-element-sec rounded-lg border px-4 py-2 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="bg-theme-element-sec border-theme-accent/10 text-foreground rounded-lg border px-4 py-2 text-xs font-black select-none">
                Page {permPage} of {totalPermPages}
              </span>
              <Button
                variant="none"
                disabled={permPage === totalPermPages}
                onClick={() =>
                  setPermPage((prev) => Math.min(prev + 1, totalPermPages))
                }
                className="bg-theme-element border-theme-accent/20 text-foreground hover:bg-theme-element-sec rounded-lg border px-4 py-2 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
