"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Play,
  Database,
  Table as TableIcon,
  RefreshCw,
  TerminalSquare,
  Code,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetDbCollections,
  useRunDbQuery,
} from "@/features/admin/hooks/use-developer";

export default function DBConsolePage() {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const { data: collectionsRes, isLoading: isCollectionsLoading } =
    useGetDbCollections();
  const tables = collectionsRes?.data || [];

  const runQueryMutation = useRunDbQuery();

  useEffect(() => {
    if (!selectedTable) return;
    const defaultQuery = `SELECT * FROM "${selectedTable}" LIMIT 50;`;
    
    toast.promise(
      runQueryMutation.mutateAsync(defaultQuery).then((res) => {
        setResult(res.data);
        return res;
      }).catch((e: any) => {
        setResult(e?.response?.data || { error: e.message });
        throw e;
      }),
      {
        loading: `Running query on ${selectedTable}...`,
        success: "Query executed successfully",
        error: "Failed to execute query",
      }
    );
  }, [selectedTable]);

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col gap-6 overflow-hidden">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Database className="h-6 w-6 text-[#2563eb]" />
          PostgreSQL Developer Console
        </h1>
        <p className="text-sm text-slate-500">
          Run raw SQL queries across your database directly from the admin panel.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex h-fit flex-col overflow-hidden rounded-[20px] border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)] shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TerminalSquare className="h-4 w-4" /> Table Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 overflow-y-auto p-4">
            <Select
              value={selectedTable}
              onValueChange={setSelectedTable}
              disabled={isCollectionsLoading}
            >
              <SelectTrigger className="rounded-xl border-slate-200">
                <div className="flex items-center gap-2">
                  {isCollectionsLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                  <SelectValue placeholder={isCollectionsLoading ? "Loading tables..." : "Quick Select Table"} />
                </div>
              </SelectTrigger>
              <SelectContent position="popper">
                <ScrollArea className="h-[300px]">
                  {tables.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden rounded-[20px] border border-slate-800 bg-[#1e1e1e] shadow-sm lg:col-span-2">
          <div className="flex justify-between border-b border-slate-800 bg-[#2d2d2d] p-3 font-semibold">
            <span className="pl-2 text-slate-200">Results Frame</span>
            <div className="flex rounded-lg border border-slate-700 bg-[#1e1e1e] p-1">
            </div>
          </div>
          <div className="custom-scrollbar flex-1 overflow-auto p-4">
            {result && Array.isArray(result) && result.length > 0 ? (
              <div className="w-full overflow-auto">
                <Table className="text-left text-sm text-[#cccccc]">
                  <TableHeader className="bg-[#252526] sticky top-0 z-10">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      {Array.from(
                        new Set(result.flatMap((item) => Object.keys(item))),
                      ).map((col) => (
                        <TableHead key={col} className="text-slate-400 font-mono text-xs uppercase p-3">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.map((row, i) => (
                      <TableRow
                        key={i}
                        className="border-b border-slate-800 transition-colors hover:bg-[#2d2d2d]"
                      >
                        {Array.from(
                          new Set(result.flatMap((item) => Object.keys(item))),
                        ).map((col) => (
                          <TableCell
                            key={col}
                            className="max-w-[200px] truncate p-3 font-mono"
                            title={typeof row[col] === 'object' && row[col] !== null ? JSON.stringify(row[col]) : String(row[col] ?? "-")}
                          >
                            {typeof row[col] === 'object' && row[col] !== null ? JSON.stringify(row[col]) : String(row[col] ?? "-")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center font-mono text-sm text-slate-500">
                {Array.isArray(result) && result.length === 0
                  ? "Query returned 0 rows."
                  : typeof result === "number" || typeof result === "bigint"
                    ? `Rows affected: ${result.toString()}`
                    : "No valid table data output"}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
