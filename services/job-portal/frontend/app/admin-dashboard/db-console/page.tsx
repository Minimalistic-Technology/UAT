"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { toast } from "sonner";
import {
  Play,
  Database,
  Table as TableIcon,
  RefreshCw,
  TerminalSquare,
  Code,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    api
      .get("/admin/developer/collections")
      .then((res) => {
        setCollections(res.data.data);
        if (res.data.data.length > 0) setSelectedCollection(res.data.data[0]);
      })
      .catch((e) =>
        toast.error(e?.response?.data?.message || "Failed to load collections"),
      );
  }, []);

  useEffect(() => {
    if (!selectedCollection) return;
    setOperation("find");
    setQuery("{}");
    setLoading(true);
    api
      .post("/admin/developer/query", {
        collectionName: selectedCollection,
        operation: "find",
        query: "{}",
      })
      .then((res) => setResult(res.data.data))
      .catch((e) => setResult(e?.response?.data || { error: e.message }))
      .finally(() => setLoading(false));
  }, [selectedCollection]);

  const handleRunQuery = async () => {
    if (!selectedCollection) return toast.error("Please select a collection");
    setLoading(true);
    try {
      const res = await api.post("/admin/developer/query", {
        collectionName: selectedCollection,
        operation,
        query,
        updateData: ["updateOne", "updateMany", "create"].includes(operation)
          ? updateData
          : undefined,
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
    <div className="flex h-[calc(100vh-100px)] flex-col gap-6 overflow-hidden">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Database className="h-6 w-6 text-[#2563eb]" />
          Developer DB Console
        </h1>
        <p className="text-sm text-slate-500">
          Run raw queries across your database directly from the admin panel.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col overflow-hidden rounded-[20px] border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm">
          <CardHeader className="border-b bg-slate-50 pb-4 dark:bg-slate-800/50">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TerminalSquare className="h-4 w-4" /> Query Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 overflow-y-auto p-4">
            <Select
              value={selectedCollection}
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue placeholder="Target Collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue placeholder="Operation" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "find",
                  "findOne",
                  "updateOne",
                  "updateMany",
                  "create",
                  "deleteOne",
                  "deleteMany",
                ].map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {operation !== "create" && (
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-32 rounded-xl bg-slate-900 font-mono text-sm text-green-400"
                placeholder="JSON Filter Query..."
              />
            )}

            {["updateOne", "updateMany", "create"].includes(operation) && (
              <Textarea
                value={updateData}
                onChange={(e) => setUpdateData(e.target.value)}
                className="h-32 rounded-xl bg-slate-900 font-mono text-sm text-blue-400"
                placeholder="JSON Update Payload..."
              />
            )}

            <Button
              onClick={handleRunQuery}
              disabled={loading}
              className="w-full rounded-xl bg-[#2563eb] font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}{" "}
              Execute Query
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden rounded-[20px] border border-slate-800 bg-[#1e1e1e] shadow-sm lg:col-span-2">
          <div className="flex justify-between border-b border-slate-800 bg-[#2d2d2d] p-3 font-semibold">
            <span className="pl-2 text-slate-200">Results Frame</span>
            <div className="flex rounded-lg border border-slate-700 bg-[#1e1e1e] p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${viewMode === "table" ? "bg-[#2563eb] text-white" : "text-slate-400"}`}
              >
                <TableIcon className="mr-1 inline h-3.5 w-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode("json")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${viewMode === "json" ? "bg-[#2563eb] text-white" : "text-slate-400"}`}
              >
                <Code className="mr-1 inline h-3.5 w-3.5" />
                JSON
              </button>
            </div>
          </div>
          <div className="custom-scrollbar flex-1 overflow-auto p-4">
            {result && viewMode === "json" ? (
              <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[#d4d4d4]">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : result && Array.isArray(result) && result.length > 0 ? (
              <table className="w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-[#252526] text-xs text-slate-400 uppercase">
                  <tr>
                    {Array.from(
                      new Set(result.flatMap((item) => Object.keys(item))),
                    )
                      .filter((k) => k !== "__v")
                      .map((col) => (
                        <th key={col} className="p-3">
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {result.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-800 font-mono text-[#cccccc] transition-colors hover:bg-[#2d2d2d]"
                    >
                      {Array.from(
                        new Set(result.flatMap((item) => Object.keys(item))),
                      )
                        .filter((k) => k !== "__v")
                        .map((col) => (
                          <td
                            key={col}
                            className="max-w-[200px] truncate p-3"
                            title={String(row[col] ?? "-")}
                          >
                            {String(row[col] ?? "-")}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full flex-col items-center justify-center font-mono text-sm text-slate-500">
                No valid table data output
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
