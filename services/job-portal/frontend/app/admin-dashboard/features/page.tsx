"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { ToggleLeft, ShieldAlert, Globe, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
                api.post("/admin/developer/query", { collectionName: "Feature", operation: "find", query: "{}" }),
                api.post("/admin/developer/query", { collectionName: "User", operation: "find", query: "{}" }),
                api.post("/admin/developer/query", { collectionName: "Company", operation: "find", query: "{}" })
            ]);
            setFeatures(fRes.data.data || []); setUsersList(uRes.data.data || []); setCompaniesList(cRes.data.data || []);
        } catch { toast.error("Failed to load options"); } finally { setLoading(false); }
    };

    useEffect(() => { fetchFeatures(); }, []);

    const updateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            await api.post("/admin/developer/query", { collectionName: "Feature", operation: "updateOne", query: JSON.stringify({ _id: id }), updateData: JSON.stringify({ $set: { status } }) });
            toast.success(`Status updated to ${status}`);
            fetchFeatures();
        } catch { toast.error("Failed to update status"); } finally { setUpdatingId(null); }
    };

    const handleAssign = async () => {
        if (!assignFeatureId || !assignTargetId) return toast.error("Select both target and feature");
        setAssigning(true);
        try {
            const queryCheck = assignType === "user" ? { feature: assignFeatureId, user: assignTargetId } : { feature: assignFeatureId, company: assignTargetId };
            const exist = await api.post("/admin/developer/query", { collectionName: "FeaturePermission", operation: "findOne", query: JSON.stringify(queryCheck) });
            if (exist.data?.data) return toast.error("Target already has permission!");
            await api.post("/admin/developer/query", { collectionName: "FeaturePermission", operation: "create", query: "{}", updateData: JSON.stringify(queryCheck) });
            toast.success("Assigned successfully!"); setAssignTargetId("");
        } catch { toast.error("Assignment failed"); } finally { setAssigning(false); }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><ToggleLeft className="w-6 h-6 text-[#2563eb]" /> Feature Flags</h1>
                    <p className="text-sm text-slate-500 mt-1">Control exactly who sees what. Instantly toggle app features.</p>
                </div>
                <Button onClick={fetchFeatures} variant="outline" className="rounded-xl font-semibold"><RefreshCw className="w-4 h-4 mr-2" />Refresh Stream</Button>
            </div>

            <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
                <CardHeader className="px-7 pt-6 pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg"><ShieldAlert className="text-[#2563eb] w-5 h-5" /> Assign Selective Access</CardTitle>
                </CardHeader>
                <CardContent className="px-7 pb-6 flex flex-col md:flex-row gap-4 items-end mt-4">
                    <div className="flex-1 w-full flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 ml-1">Select System Feature</label>
                        <Select value={assignFeatureId} onValueChange={setAssignFeatureId}>
                            <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200"><SelectValue placeholder="Select Feature" /></SelectTrigger>
                            <SelectContent>{features.map(f => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-48 flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 ml-1">Target Dimension</label>
                        <Select value={assignType} onValueChange={(v: any) => setAssignType(v)}>
                            <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="user">Specific User</SelectItem><SelectItem value="company">Entire Company</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 ml-1">Assign Target Entity</label>
                        <Select value={assignTargetId} onValueChange={setAssignTargetId}>
                            <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-slate-200"><SelectValue placeholder="Select Target..." /></SelectTrigger>
                            <SelectContent>
                                {assignType === "user" ? usersList.map(u => <SelectItem key={u._id} value={u._id}>{u.email}</SelectItem>) : companiesList.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleAssign} disabled={assigning} className="rounded-xl h-12 px-6 shadow-sm font-semibold bg-[#2563eb] text-white hover:bg-blue-700">Add Permission</Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 mt-2">
                {features.map(f => (
                    <Card key={f._id} className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
                        <CardContent className="flex flex-col md:flex-row justify-between p-6 gap-6 items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-lg font-bold">{f.name}</h2>
                                    <Badge variant="outline" className="font-mono bg-slate-100 text-slate-600 border-slate-200 px-3">{f.slug}</Badge>
                                </div>
                                <p className="text-sm text-slate-500">{f.description}</p>
                            </div>
                            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                                {["disabled", "beta", "public"].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => updateStatus(f._id, status)}
                                        disabled={updatingId === f._id}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition flex items-center gap-2 border ${f.status === status ?
                                                (status === "disabled" ? "bg-red-50 text-red-700 border-red-200 shadow-sm" : status === "beta" ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" : "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm")
                                                : "bg-transparent text-slate-400 border-transparent hover:bg-slate-200/50"
                                            }`}
                                    >
                                        {status === "disabled" ? <Lock className="w-3.5 h-3.5" /> : status === "beta" ? <ShieldAlert className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
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
