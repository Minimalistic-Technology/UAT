"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import { Play, Database, Table as TableIcon, RefreshCw, TerminalSquare, Code, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DBConsolePage = () => {
    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>("");
    const [operation, setOperation] = useState<string>("find");
    const [query, setQuery] = useState<string>("{}");
    const [updateData, setUpdateData] = useState<string>("{}");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"table" | "json">("table");

    const fetchCollections = async () => {
        try {
            const res = await api.get("/admin/developer/collections");
            setCollections(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedCollection(res.data.data[0]);
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Failed to load collections");
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    // Automatically fetch data when a collection is selected
    useEffect(() => {
        if (selectedCollection) {
            // Temporarily set operation to 'find' and query to empty 
            // so it cleanly loads all records without using old queries
            setOperation("find");
            setQuery("{}");

            const fetchInitialData = async () => {
                setLoading(true);
                setResult(null);
                try {
                    const res = await api.post("/admin/developer/query", {
                        collectionName: selectedCollection,
                        operation: "find",
                        query: "{}"
                    });
                    setResult(res.data.data);
                } catch (e: any) {
                    setResult(e?.response?.data || { error: e.message });
                } finally {
                    setLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [selectedCollection]);

    const handleRunQuery = async () => {
        if (!selectedCollection) return toast.error("Please select a collection");

        setLoading(true);
        setResult(null);
        try {
            const res = await api.post("/admin/developer/query", {
                collectionName: selectedCollection,
                operation,
                query,
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-600" />
                        Developer DB Console
                    </h1>
                    <p className="text-sm text-slate-500">Run raw queries across your database directly from the admin panel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* LEFT PANEL: Query Builder */}
                <div className="lg:col-span-1 bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-slate-50 font-semibold flex items-center gap-2">
                        <TerminalSquare className="w-4 h-4" /> Query Builder
                    </div>

                    <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                        {/* Collection Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                <LayoutList className="w-3 h-3" /> Target Collection
                            </label>
                            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Table..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {collections.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Operation Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600">Db Operation</label>
                            <Select value={operation} onValueChange={setOperation}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="find">find (Fetch Multiple)</SelectItem>
                                    <SelectItem value="findOne">findOne (Fetch Single)</SelectItem>
                                    <SelectItem value="updateOne">updateOne (Modify Single)</SelectItem>
                                    <SelectItem value="updateMany">updateMany (Modify Multiple)</SelectItem>
                                    <SelectItem value="create">create (Insert New)</SelectItem>
                                    <SelectItem value="deleteOne">deleteOne (Remove Single)</SelectItem>
                                    <SelectItem value="deleteMany">deleteMany (Remove Multiple)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Query Filter Area */}
                        {operation !== "create" && (
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-xs font-semibold text-slate-600">JSON Filter Query (e.g., {`{"_id": "123"}`})</label>
                                <Textarea
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="font-mono text-sm bg-slate-900 text-green-400 h-32"
                                />
                            </div>
                        )}

                        {/* Update / Insert Data Area */}
                        {["updateOne", "updateMany", "create"].includes(operation) && (
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-xs font-semibold text-slate-600">JSON Data Payload</label>
                                <Textarea
                                    value={updateData}
                                    onChange={(e) => setUpdateData(e.target.value)}
                                    className="font-mono text-sm bg-slate-900 text-blue-400 h-32"
                                />
                            </div>
                        )}

                        <Button
                            onClick={handleRunQuery}
                            disabled={loading}
                            className="mt-2 bg-indigo-600 hover:bg-indigo-700 w-full"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            Execute Query
                        </Button>
                    </div>
                </div>

                {/* RIGHT PANEL: Results */}
                <div className="lg:col-span-2 bg-[#1e1e1e] border rounded-lg shadow-sm flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-700 bg-[#2d2d2d] font-semibold flex items-center justify-between">
                        <span className="text-slate-200">Query Results</span>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-[#1e1e1e] p-1 rounded-md border border-slate-700">
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                                >
                                    <TableIcon className="w-3.5 h-3.5" /> Table
                                </button>
                                <button
                                    onClick={() => setViewMode("json")}
                                    className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${viewMode === "json" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                                >
                                    <Code className="w-3.5 h-3.5" /> JSON
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {result ? (
                            viewMode === "json" ? (
                                <div className="p-4">
                                    <pre className="text-sm font-mono text-[#d4d4d4] whitespace-pre-wrap">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                Array.isArray(result) && result.length > 0 ? (
                                    <table className="w-full text-sm text-left whitespace-nowrap">
                                        <thead className="text-xs uppercase bg-[#252526] text-slate-400 sticky top-0">
                                            <tr>
                                                {Array.from(new Set(result.flatMap(item => Object.keys(item)))).filter(k => k !== '__v').map(col => (
                                                    <th key={col} className="px-4 py-3 border-b border-slate-700 font-medium">{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.map((row, i) => (
                                                <tr key={i} className="border-b border-slate-700 hover:bg-[#2d2d2d] text-[#cccccc] font-mono text-[13px]">
                                                    {Array.from(new Set(result.flatMap(item => Object.keys(item)))).filter(k => k !== '__v').map(col => {
                                                        let value = row[col];
                                                        if (value === null || value === undefined) value = "-";
                                                        else if (typeof value === "object") value = JSON.stringify(value);
                                                        else if (typeof value === "boolean") value = value.toString();

                                                        return (
                                                            <td key={col} className="px-4 py-2.5 max-w-[200px] truncate" title={String(value)}>
                                                                {String(value)}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-4 flex flex-col items-center justify-center h-full text-slate-500 font-mono text-sm">
                                        <TableIcon className="w-8 h-8 mb-2 opacity-50" />
                                        Data is not an array. Please use JSON view.
                                    </div>
                                )
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 font-mono text-sm px-4 text-center">
                                // Run a query to see results here
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DBConsolePage;
