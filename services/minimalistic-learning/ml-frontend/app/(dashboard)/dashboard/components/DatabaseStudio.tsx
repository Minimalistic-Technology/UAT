import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Database, Search, TerminalSquare, AlertCircle, CheckCircle2, Play } from "lucide-react";

export const DatabaseStudio = () => {
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
                <div className="flex flex-col items-center justify-center py-10 text-red-500 gap-3">
                    <AlertCircle size={32} />
                    <p className="font-mono text-sm max-w-lg text-center break-words bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>
                </div>
            );
        }

        if (!result) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-foreground/30 gap-3">
                    <TerminalSquare size={48} className="opacity-20" />
                    <p className="font-medium text-sm">Output terminal ready. Execute a query to view results.</p>
                </div>
            );
        }

        if (result && typeof result.affectedRows !== 'undefined') {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-theme-action gap-3">
                    <CheckCircle2 size={40} className="text-theme-action animate-pulse" />
                    <h4 className="font-black text-xl">Query Executed</h4>
                    <p className="font-bold text-sm bg-theme-action/10 px-4 py-2 rounded-xl text-theme-action border border-theme-action/20">Affected Rows: {result.affectedRows}</p>
                </div>
            );
        }

        if (Array.isArray(result)) {
            if (result.length === 0) {
                return (
                    <div className="p-8 text-center text-foreground/50 font-bold uppercase tracking-widest text-xs">
                        0 Rows Returned
                    </div>
                );
            }

            const columns = Object.keys(result[0]);

            return (
                <div className="overflow-x-auto rounded-b-[2rem]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-black uppercase text-foreground/50 bg-theme-element-sec/50 border-b border-theme-accent/10">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col} className="px-6 py-4 tracking-widest">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-accent/5">
                            {result.map((row, idx) => (
                                <tr key={idx} className="hover:bg-theme-element-sec/20 transition-colors font-semibold text-foreground/80">
                                    {columns.map((col) => {
                                        const val = row[col];
                                        const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL');
                                        return (
                                            <td key={col} className="px-6 py-4 whitespace-nowrap max-w-[250px] truncate" title={displayVal}>
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

        return (
            <pre className="p-6 overflow-x-auto text-sm font-mono text-theme-action leading-relaxed">
                {JSON.stringify(result, null, 2)}
            </pre>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Tables Sidebar */}
                <div className="bg-theme-element border border-theme-accent/20 rounded-[2rem] p-6 shadow-sm flex flex-col h-[500px]">
                    <div className="flex items-center gap-2 mb-6">
                        <Database className="text-theme-action" size={18} />
                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Database Tables</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 relative pr-2 custom-scrollbar">
                        {tables.length === 0 ? (
                            <div className="text-xs font-semibold text-foreground/40 text-center mt-10">Loading tables...</div>
                        ) : (
                            tables.map((table) => (
                                <button
                                    key={table}
                                    onClick={() => handleTableClick(table)}
                                    className="w-full text-left px-4 py-3 text-sm font-bold text-foreground/60 hover:text-white hover:bg-theme-action/10 rounded-xl transition-all flex items-center justify-between group"
                                >
                                    <span className="truncate">{table}</span>
                                    <Search size={14} className="opacity-0 group-hover:opacity-100 group-hover:text-theme-action transition-all" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Query Area */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-theme-element border border-theme-accent/20 rounded-[2rem] overflow-hidden shadow-sm flex flex-col focus-within:border-theme-action/50 transition-colors">
                        <div className="bg-theme-element-sec/50 px-6 py-3 border-b border-theme-accent/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TerminalSquare size={16} className="text-foreground/40" />
                                <span className="text-xs font-black text-foreground/50 uppercase tracking-widest">SQL Terminal</span>
                            </div>
                            <button
                                onClick={handleExecute}
                                disabled={loading}
                                className="bg-theme-action hover:bg-theme-action/90 text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-md active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Play size={12} fill="currentColor" />
                                )}
                                {loading ? 'Running...' : 'Execute'}
                            </button>
                        </div>

                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. SELECT * FROM User WHERE role = 'admin';"
                            className="w-full bg-transparent text-foreground font-mono text-sm p-6 h-40 focus:outline-none resize-none placeholder:text-foreground/20 leading-relaxed"
                            spellCheck={false}
                        />
                    </div>

                    {/* Results Area */}
                    <div className="bg-theme-element border border-theme-accent/20 rounded-[2rem] flex-1 min-h-[300px] shadow-sm flex flex-col">
                        <div className="px-6 py-4 border-b border-theme-accent/10 bg-theme-element-sec/30">
                            <h2 className="text-xs font-black text-foreground/50 uppercase tracking-widest">Query Output</h2>
                        </div>
                        <div className="flex-1 bg-transparent overflow-hidden">
                            {renderResult()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
