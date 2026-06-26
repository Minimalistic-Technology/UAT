import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Database,
  Search,
  TerminalSquare,
  AlertCircle,
  CheckCircle2,
  Play,
} from "lucide-react";

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
      setError(
        err.response?.data?.message || err.message || "Query execution failed",
      );
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
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-red-500">
          <AlertCircle size={32} />
          <p className="max-w-lg rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center font-mono text-sm break-words">
            {error}
          </p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-foreground/30 flex flex-col items-center justify-center gap-3 py-20">
          <TerminalSquare size={48} className="opacity-20" />
          <p className="text-sm font-medium">
            Output terminal ready. Execute a query to view results.
          </p>
        </div>
      );
    }

    if (result && typeof result.affectedRows !== "undefined") {
      return (
        <div className="text-theme-action flex flex-col items-center justify-center gap-3 py-12">
          <CheckCircle2 size={40} className="text-theme-action animate-pulse" />
          <h4 className="text-xl font-black">Query Executed</h4>
          <p className="bg-theme-action/10 text-theme-action border-theme-action/20 rounded-xl border px-4 py-2 text-sm font-bold">
            Affected Rows: {result.affectedRows}
          </p>
        </div>
      );
    }

    if (Array.isArray(result)) {
      if (result.length === 0) {
        return (
          <div className="text-foreground/50 p-8 text-center text-xs font-bold tracking-widest uppercase">
            0 Rows Returned
          </div>
        );
      }

      const columns = Object.keys(result[0]);

      return (
        <div className="overflow-x-auto rounded-b-[2rem]">
          <table className="w-full text-left text-sm">
            <thead className="text-foreground/50 bg-theme-element-sec/50 border-theme-accent/10 border-b text-xs font-black uppercase">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-6 py-4 tracking-widest">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-theme-accent/5 divide-y">
              {result.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-theme-element-sec/20 text-foreground/80 font-semibold transition-colors"
                >
                  {columns.map((col) => {
                    const val = row[col];
                    const displayVal =
                      typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val ?? "NULL");
                    return (
                      <td
                        key={col}
                        className="max-w-[250px] truncate px-6 py-4 whitespace-nowrap"
                        title={displayVal}
                      >
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
      <pre className="text-theme-action overflow-x-auto p-6 font-mono text-sm leading-relaxed">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Tables Sidebar */}
        <div className="bg-theme-element border-theme-accent/20 flex h-[500px] flex-col rounded-[2rem] border p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <Database className="text-theme-action" size={18} />
            <h2 className="text-foreground text-sm font-black tracking-widest uppercase">
              Database Tables
            </h2>
          </div>

          <div className="custom-scrollbar relative flex-1 space-y-1 overflow-y-auto pr-2">
            {tables.length === 0 ? (
              <div className="text-foreground/40 mt-10 text-center text-xs font-semibold">
                Loading tables...
              </div>
            ) : (
              tables.map((table) => (
                <button
                  key={table}
                  onClick={() => handleTableClick(table)}
                  className="text-foreground/60 hover:bg-theme-action/10 group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:text-white"
                >
                  <span className="truncate">{table}</span>
                  <Search
                    size={14}
                    className="group-hover:text-theme-action opacity-0 transition-all group-hover:opacity-100"
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Query Area */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="bg-theme-element border-theme-accent/20 focus-within:border-theme-action/50 flex flex-col overflow-hidden rounded-[2rem] border shadow-sm transition-colors">
            <div className="bg-theme-element-sec/50 border-theme-accent/10 flex items-center justify-between border-b px-6 py-3">
              <div className="flex items-center gap-2">
                <TerminalSquare size={16} className="text-foreground/40" />
                <span className="text-foreground/50 text-xs font-black tracking-widest uppercase">
                  SQL Terminal
                </span>
              </div>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="bg-theme-action hover:bg-theme-action/90 flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <Play size={12} fill="currentColor" />
                )}
                {loading ? "Running..." : "Execute"}
              </button>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. SELECT * FROM User WHERE role = 'admin';"
              className="text-foreground placeholder:text-foreground/20 h-40 w-full resize-none bg-transparent p-6 font-mono text-sm leading-relaxed focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Results Area */}
          <div className="bg-theme-element border-theme-accent/20 flex min-h-[300px] flex-1 flex-col rounded-[2rem] border shadow-sm">
            <div className="border-theme-accent/10 bg-theme-element-sec/30 border-b px-6 py-4">
              <h2 className="text-foreground/50 text-xs font-black tracking-widest uppercase">
                Query Output
              </h2>
            </div>
            <div className="flex-1 overflow-hidden bg-transparent">
              {renderResult()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
