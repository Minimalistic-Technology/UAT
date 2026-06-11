"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { Play, Database, Table as TableIcon, RefreshCw, TerminalSquare, Code, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DBConsolePage() {
    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>("");
    const [operation, setOperation] = useState<string>("find");
    const [query, setQuery] = useState<string>("{}");
    const [updateData, setUpdateData] = useState<string>("{}");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"table" | "json">("table");

    useEffect(() => {
        api.get("/admin/developer/collections")
            .then(res => {
                setCollections(res.data.data);
                if (res.data.data.length > 0) setSelectedCollection(res.data.data[0]);
            })
            .catch(e => toast.error(e?.response?.data?.message || "Failed to load collections"));
    }, []);

    useEffect(() => {
        if (!selectedCollection) return;
        setOperation("find"); setQuery("{}");
        setLoading(true);
        api.post("/admin/developer/query", { collectionName: selectedCollection, operation: "find", query: "{}" })
            .then(res => setResult(res.data.data))
            .catch(e => setResult(e?.response?.data || { error: e.message }))
            .finally(() => setLoading(false));
    }, [selectedCollection]);

    const handleRunQuery = async () => {
        if (!selectedCollection) return toast.error("Please select a collection");
        setLoading(true);
        try {
            const res = await api.post("/admin/developer/query", {
                collectionName: selectedCollection, operation, query,
                updateData: ["updateOne", "updateMany", "create"].includes(operation) ? updateData : undefined
            });
            setResult(res.data.data);
            toast.success("Query executed successfully!");
        } catch (e: any) {
            setResult(e?.response?.data || { error: e.message });
            toast.error("Query Execution Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden gap-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="w-6 h-6 text-[#2563eb]" />Developer DB Console</h1>
                <p className="text-sm text-slate-500">Run raw queries across your database directly from the admin panel.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <Card className="shadow-sm rounded-[20px] flex flex-col overflow-hidden border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4 border-b">
                        <CardTitle className="text-sm flex items-center gap-2"><TerminalSquare className="w-4 h-4" /> Query Builder</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-4 overflow-y-auto">
                        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                            <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Target Collection" /></SelectTrigger>
                            <SelectContent>{collections.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>

                        <Select value={operation} onValueChange={setOperation}>
                            <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Operation" /></SelectTrigger>
                            <SelectContent>
                                {["find", "findOne", "updateOne", "updateMany", "create", "deleteOne", "deleteMany"].map(op => (
                                    <SelectItem key={op} value={op}>{op}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {operation !== "create" && (
                            <Textarea value={query} onChange={e => setQuery(e.target.value)} className="font-mono text-sm bg-slate-900 text-green-400 h-32 rounded-xl" placeholder="JSON Filter Query..." />
                        )}

                        {["updateOne", "updateMany", "create"].includes(operation) && (
                            <Textarea value={updateData} onChange={e => setUpdateData(e.target.value)} className="font-mono text-sm bg-slate-900 text-blue-400 h-32 rounded-xl" placeholder="JSON Update Payload..." />
                        )}

                        <Button onClick={handleRunQuery} disabled={loading} className="w-full rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold shadow-sm">
                            {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />} Execute Query
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm rounded-[20px] bg-[#1e1e1e] flex flex-col overflow-hidden border border-slate-800">
                    <div className="p-3 border-b border-slate-800 bg-[#2d2d2d] font-semibold flex justify-between">
                        <span className="text-slate-200 pl-2">Results Frame</span>
                        <div className="flex bg-[#1e1e1e] p-1 rounded-lg border border-slate-700">
                            <button onClick={() => setViewMode("table")} className={`px-3 py-1 text-xs rounded-md font-semibold transition ${viewMode === "table" ? "bg-[#2563eb] text-white" : "text-slate-400"}`}><TableIcon className="w-3.5 h-3.5 inline mr-1" />Table</button>
                            <button onClick={() => setViewMode("json")} className={`px-3 py-1 text-xs rounded-md font-semibold transition ${viewMode === "json" ? "bg-[#2563eb] text-white" : "text-slate-400"}`}><Code className="w-3.5 h-3.5 inline mr-1" />JSON</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                        {result && viewMode === "json" ? (
                            <pre className="text-[13px] font-mono text-[#d4d4d4] whitespace-pre-wrap leading-relaxed">{JSON.stringify(result, null, 2)}</pre>
                        ) : result && Array.isArray(result) && result.length > 0 ? (
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs uppercase text-slate-400 bg-[#252526] sticky top-0">
                                    <tr>{Array.from(new Set(result.flatMap(item => Object.keys(item)))).filter(k => k !== '__v').map(col => <th key={col} className="p-3">{col}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {result.map((row, i) => (
                                        <tr key={i} className="border-b border-slate-800 text-[#cccccc] font-mono hover:bg-[#2d2d2d] transition-colors">
                                            {Array.from(new Set(result.flatMap(item => Object.keys(item)))).filter(k => k !== '__v').map(col => (
                                                <td key={col} className="p-3 max-w-[200px] truncate" title={String(row[col] ?? "-")}>{String(row[col] ?? "-")}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-slate-500 font-mono text-sm flex flex-col items-center justify-center h-full">No valid table data output</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
