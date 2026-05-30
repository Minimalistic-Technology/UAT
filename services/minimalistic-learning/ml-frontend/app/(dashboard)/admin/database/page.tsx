"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function DatabaseStudioPage() {
    const [tables, setTables] = useState<string[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await api.get("/admin/db/tables");
            setTables(res.data.data.tables || []);
        } catch (err: any) {
            toast.error("Failed to fetch database tables");
        }
    };

    const handleExecute = async () => {
        if (!query.trim()) {
            toast.error("Please enter a SQL query");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await api.post("/admin/db/query", { query });
            setResult(res.data.data.result);
            toast.success("Query executed successfully");
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Query execution failed");
            toast.error("Query failed");
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (tableName: string) => {
        setQuery(`SELECT * FROM ${tableName} LIMIT 50;`);
    };

    const renderResult = () => {
        if (error) {
            return (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl font-mono text-sm">
                    {error}
                </div>
            );
        }

        if (!result) {
            return (
                <div className="text-gray-400 text-center py-10">
                    Execute a query to see results here.
                </div>
            );
        }

        // For non-select queries (update/delete/insert)
        if (result && typeof result.affectedRows !== 'undefined') {
            return (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl font-mono text-sm">
                    ✅ Query OK <br /> Affected Rows: {result.affectedRows}
                </div>
            );
        }

        // For SELECT queries returning arrays
        if (Array.isArray(result)) {
            if (result.length === 0) {
                return <div className="text-gray-400 p-4">0 rows returned.</div>;
            }

            const columns = Object.keys(result[0]);

            return (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-white/5">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col} className="px-4 py-3 whitespace-nowrap">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {result.map((row, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    {columns.map((col) => {
                                        const val = row[col];
                                        const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL');
                                        return (
                                            <td key={col} className="px-4 py-3 whitespace-nowrap max-w-[200px] truncate" title={displayVal}>
                                                {displayVal}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Fallback for raw JSON
        return (
            <pre className="p-4 rounded-xl bg-black/40 border border-white/10 text-emerald-400 overflow-x-auto text-sm font-mono leading-relaxed">
                {JSON.stringify(result, null, 2)}
            </pre>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">SQLite Studio</h1>
                    <p className="text-gray-400 text-sm">Manage your local SQLite database with raw SQL queries</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Tables Sidebar */}
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-5 flex flex-col h-[600px]">
                        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">Tables</h2>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                            {tables.length === 0 ? (
                                <div className="text-xs text-gray-500">Loading tables...</div>
                            ) : (
                                tables.map((table) => (
                                    <button
                                        key={table}
                                        onClick={() => handleTableClick(table)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 group"
                                    >
                                        <svg className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                        </svg>
                                        {table}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Query Area */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                            <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Query Editor</span>
                                <button
                                    onClick={handleExecute}
                                    disabled={loading}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Execute
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="SELECT * FROM User LIMIT 10;"
                                className="w-full bg-transparent text-emerald-400 font-mono text-sm p-4 h-48 focus:outline-none resize-none placeholder:text-gray-600"
                                spellCheck={false}
                            />
                        </div>

                        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 flex-1 min-h-[400px] shadow-xl flex flex-col">
                            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-4">Output</h2>
                            <div className="flex-1 bg-black/20 rounded-xl overflow-hidden">
                                {renderResult()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
