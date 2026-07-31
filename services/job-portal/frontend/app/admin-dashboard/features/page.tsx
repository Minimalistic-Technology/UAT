"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { ToggleLeft, ShieldAlert, Globe, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function FeatureFlagsPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [assignType, setAssignType] = useState<"user" | "company">("user");
  const [assignFeatureId, setAssignFeatureId] = useState("");
  const [assignTargetId, setAssignTargetId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const [fRes, uRes, cRes] = await Promise.all([
        api.post("/admin/developer/query", {
          collectionName: "Feature",
          operation: "find",
          query: "{}",
        }),
        api.post("/admin/developer/query", {
          collectionName: "User",
          operation: "find",
          query: "{}",
        }),
        api.post("/admin/developer/query", {
          collectionName: "Company",
          operation: "find",
          query: "{}",
        }),
      ]);
      setFeatures(fRes.data.data || []);
      setUsersList(uRes.data.data || []);
      setCompaniesList(cRes.data.data || []);
    } catch {
      toast.error("Failed to load options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await api.post("/admin/developer/query", {
        collectionName: "Feature",
        operation: "updateOne",
        query: JSON.stringify({ _id: id }),
        updateData: JSON.stringify({ $set: { status } }),
      });
      toast.success(`Status updated to ${status}`);
      fetchFeatures();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssign = async () => {
    if (!assignFeatureId || !assignTargetId)
      return toast.error("Select both target and feature");
    setAssigning(true);
    try {
      const queryCheck =
        assignType === "user"
          ? { feature: assignFeatureId, user: assignTargetId }
          : { feature: assignFeatureId, company: assignTargetId };
      const exist = await api.post("/admin/developer/query", {
        collectionName: "FeaturePermission",
        operation: "findOne",
        query: JSON.stringify(queryCheck),
      });
      if (exist.data?.data)
        return toast.error("Target already has permission!");
      await api.post("/admin/developer/query", {
        collectionName: "FeaturePermission",
        operation: "create",
        query: "{}",
        updateData: JSON.stringify(queryCheck),
      });
      toast.success("Assigned successfully!");
      setAssignTargetId("");
    } catch {
      toast.error("Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <ToggleLeft className="h-6 w-6 text-[#2563eb]" /> Feature Flags
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Control exactly who sees what. Instantly toggle app features.
          </p>
        </div>
        <Button
          onClick={fetchFeatures}
          variant="outline"
          className="rounded-xl font-semibold"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Stream
        </Button>
      </div>

      <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm dark:bg-slate-900">
        <CardHeader className="px-7 pt-6 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-[#2563eb]" /> Assign Selective
            Access
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col items-end gap-4 px-7 pb-6 md:flex-row">
          <div className="flex w-full flex-1 flex-col gap-2">
            <label className="ml-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Select System Feature
            </label>
            <Select value={assignFeatureId} onValueChange={setAssignFeatureId}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                <SelectValue placeholder="Select Feature" />
              </SelectTrigger>
              <SelectContent>
                {features.map((f) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-48">
            <label className="ml-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Target Dimension
            </label>
            <Select
              value={assignType}
              onValueChange={(v: any) => setAssignType(v)}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Specific User</SelectItem>
                <SelectItem value="company">Entire Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full flex-1 flex-col gap-2">
            <label className="ml-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Assign Target Entity
            </label>
            <Select value={assignTargetId} onValueChange={setAssignTargetId}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50">
                <SelectValue placeholder="Select Target..." />
              </SelectTrigger>
              <SelectContent>
                {assignType === "user"
                  ? usersList.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.email}
                      </SelectItem>
                    ))
                  : companiesList.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAssign}
            disabled={assigning}
            className="h-12 rounded-xl bg-[#2563eb] px-6 font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Add Permission
          </Button>
        </CardContent>
      </Card>

      <div className="mt-2 grid gap-4">
        {features.map((f) => (
          <Card
            key={f._id}
            className="rounded-[20px] border-0 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm dark:bg-slate-900"
          >
            <CardContent className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-lg font-bold">{f.name}</h2>
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-slate-100 px-3 font-mono text-slate-600"
                  >
                    {f.slug}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{f.description}</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1.5 shadow-inner dark:border-slate-700 dark:bg-slate-800">
                {["disabled", "beta", "public"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(f._id, status)}
                    disabled={updatingId === f._id}
                    className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition ${
                      f.status === status
                        ? status === "disabled"
                          ? "border-red-200 bg-red-50 text-red-700 shadow-sm"
                          : status === "beta"
                            ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-transparent bg-transparent text-slate-400 hover:bg-slate-200/50"
                    }`}
                  >
                    {status === "disabled" ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : status === "beta" ? (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                    {status}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
