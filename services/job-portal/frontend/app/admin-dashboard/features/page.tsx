"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { ToggleLeft, ShieldAlert, Globe, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeatureFlagsPage() {
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Assignment Form State
    const [assignType, setAssignType] = useState<"user" | "company">("user");
    const [assignFeatureId, setAssignFeatureId] = useState("");
    const [assignTargetId, setAssignTargetId] = useState("");
    const [assigning, setAssigning] = useState(false);

    // Data for Dropdowns
    const [usersList, setUsersList] = useState<any[]>([]);
    const [companiesList, setCompaniesList] = useState<any[]>([]);

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const [featuresRes, usersRes, companiesRes] = await Promise.all([
                api.post("/admin/developer/query", { collectionName: "Feature", operation: "find", query: "{}" }),
                api.post("/admin/developer/query", { collectionName: "User", operation: "find", query: "{}" }),
                api.post("/admin/developer/query", { collectionName: "Company", operation: "find", query: "{}" })
            ]);
            setFeatures(featuresRes.data.data || []);
            setUsersList(usersRes.data.data || []);
            setCompaniesList(companiesRes.data.data || []);
        } catch (error) {
            toast.error("Failed to load options");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            await api.post("/admin/developer/query", {
                collectionName: "Feature",
                operation: "updateOne",
                query: JSON.stringify({ _id: id }),
                updateData: JSON.stringify({ $set: { status: newStatus } })
            });
            toast.success(`Feature status updated to ${newStatus}`);
            fetchFeatures(); // Refresh UI
        } catch (error) {
            toast.error("Failed to update feature status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAssignFeature = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignFeatureId || !assignTargetId) return toast.error("Please fill all fields");

        setAssigning(true);
        try {
            // Check if permission already exists
            const queryCheck = assignType === "user"
                ? { feature: assignFeatureId, user: assignTargetId }
                : { feature: assignFeatureId, company: assignTargetId };

            const exist = await api.post("/admin/developer/query", {
                collectionName: "FeaturePermission",
                operation: "findOne",
                query: JSON.stringify(queryCheck)
            });

            if (exist.data?.data) {
                setAssigning(false);
                return toast.error("This target already has permission for the feature!");
            }

            // Create Permission
            await api.post("/admin/developer/query", {
                collectionName: "FeaturePermission",
                operation: "create",
                query: "{}",
                updateData: JSON.stringify(queryCheck)
            });

            toast.success(`Feature successfully assigned to ${assignType}!`);
            setAssignTargetId("");

        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || "Failed to assign feature");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ToggleLeft className="w-6 h-6 text-indigo-600" />
                        Feature Flags Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Control exactly who sees what. Instantly toggle your app's powerful features.
                    </p>
                </div>
                <Button onClick={fetchFeatures} variant="outline" size="sm">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Status
                </Button>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6 mb-2">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-600" />
                    Assign Feature Access (Beta/Selective)
                </h2>
                <form onSubmit={handleAssignFeature} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase">Select Feature</label>
                        <select
                            value={assignFeatureId}
                            onChange={e => setAssignFeatureId(e.target.value)}
                            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            <option value="" disabled>-- Choose a Feature --</option>
                            {features.map(f => (
                                <option key={f._id} value={f._id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase">Assign To</label>
                        <select
                            value={assignType}
                            onChange={e => setAssignType(e.target.value as "user" | "company")}
                            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="user">Specific User</option>
                            <option value="company">Entire Company</option>
                        </select>
                    </div>

                    <div className="flex-1 w-full">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block uppercase">
                            {assignType === "user" ? "Select User Email" : "Select Company"}
                        </label>
                        <select
                            value={assignTargetId}
                            onChange={e => setAssignTargetId(e.target.value)}
                            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                            required
                        >
                            <option value="" disabled>-- Select a Target --</option>
                            {assignType === "user"
                                ? usersList.map(u => <option key={u._id} value={u._id}>{u.email}</option>)
                                : companiesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                            }
                        </select>
                    </div>

                    <Button type="submit" disabled={assigning || !assignFeatureId} className="h-10 w-full md:w-auto px-6 whitespace-nowrap">
                        {assigning ? "Assigning..." : "Add Permission"}
                    </Button>
                </form>
            </div>

            <div className="grid gap-4 mt-2">
                {loading && features.length === 0 ? (
                    <div className="text-center p-10 text-slate-500">Loading features...</div>
                ) : features.length === 0 ? (
                    <div className="text-center p-10 bg-slate-50 rounded-lg border border-dashed">No features found in database.</div>
                ) : (
                    features.map(feature => (
                        <div key={feature._id} className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-lg font-bold text-slate-800">{feature.name}</h2>
                                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border">
                                        {feature.slug}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">{feature.description}</p>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0 md:w-[320px]">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Set Feature Status:
                                </span>
                                <div className="grid grid-cols-3 gap-2 w-full">
                                    {/* Switch 1: DISABLED */}
                                    <button
                                        onClick={() => handleUpdateStatus(feature._id, "disabled")}
                                        disabled={updatingId === feature._id}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-lg border transition-all ${feature.status === "disabled"
                                            ? "bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-500"
                                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                            }`}
                                    >
                                        <Lock className={`w-4 h-4 ${feature.status === 'disabled' ? 'text-red-600' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-bold uppercase">Disabled</span>
                                    </button>

                                    {/* Switch 2: BETA */}
                                    <button
                                        onClick={() => handleUpdateStatus(feature._id, "beta")}
                                        disabled={updatingId === feature._id}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-lg border transition-all ${feature.status === "beta"
                                            ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm ring-1 ring-amber-500"
                                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                            }`}
                                    >
                                        <ShieldAlert className={`w-4 h-4 ${feature.status === 'beta' ? 'text-amber-600' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-bold uppercase">Beta (Select)</span>
                                    </button>

                                    {/* Switch 3: PUBLIC */}
                                    <button
                                        onClick={() => handleUpdateStatus(feature._id, "public")}
                                        disabled={updatingId === feature._id}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-lg border transition-all ${feature.status === "public"
                                            ? "bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500"
                                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                            }`}
                                    >
                                        <Globe className={`w-4 h-4 ${feature.status === 'public' ? 'text-green-600' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-bold uppercase">Public (All)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
