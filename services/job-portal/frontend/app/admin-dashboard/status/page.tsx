"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Server, Database, Globe, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HealthData {
  server: string;
  database: string;
  timestamp: string;
  uptime: number;
}

export default function StatusPage() {
  const [status, setStatus] = useState<"loading" | "operational" | "degraded" | "outage">("loading");
  const [data, setData] = useState<HealthData | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/health`);
      const result = await res.json();

      if (res.ok && result.data) {
        setData(result.data);
        setStatus(result.data.database === "operational" ? "operational" : "degraded");
      } else {
        setData(result?.data || null);
        setStatus("degraded");
      }
    } catch (error) {
      setStatus("outage");
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (state: string) => {
    if (state === "operational") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (state === "degraded") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    if (state === "loading") return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const StatusIcon = ({ state }: { state: string }) => {
    if (state === "operational") return <CheckCircle2 className="size-6 text-emerald-500" />;
    if (state === "degraded") return <AlertCircle className="size-6 text-amber-500" />;
    if (state === "loading") return <RefreshCcw className="size-6 text-blue-500 animate-spin" />;
    return <XCircle className="size-6 text-red-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">System Status</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring of global infrastructure.</p>
        </div>
        <Button onClick={fetchHealth} disabled={status === "loading"} variant="outline" className="gap-2">
          <RefreshCcw className={cn("size-4", status === "loading" && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className={cn("rounded-2xl border p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 transition-colors duration-500", getStatusColor(status))}>
        <StatusIcon state={status} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold font-heading">
            {status === "operational" && "All Systems Operational"}
            {status === "degraded" && "Partial System Outage"}
            {status === "outage" && "Major System Outage"}
            {status === "loading" && "Checking Systems..."}
          </h2>
          <p className="text-sm opacity-80 mt-1">
            Last checked at {lastChecked.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Globe className="size-5 text-muted-foreground" />
              <span className={cn("text-[10px] font-bold px-2 py-1 flex items-center gap-1.5 rounded-full uppercase tracking-wider", status === 'outage' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500')}>
                {status === 'outage' ? 'Offline' : 'Operational'}
              </span>
            </div>
            <CardTitle className="text-lg mt-4">Frontend App</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Main website UI dashboard</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Server className="size-5 text-muted-foreground" />
              <span className={cn("text-[10px] font-bold px-2 py-1 flex items-center gap-1.5 rounded-full uppercase tracking-wider", data?.server === 'operational' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                {data?.server || (status === 'loading' ? 'Checking' : 'Offline')}
              </span>
            </div>
            <CardTitle className="text-lg mt-4">API Server</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Core REST APIs and Webhooks</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Database className="size-5 text-muted-foreground" />
              <span className={cn("text-[10px] font-bold px-2 py-1 flex items-center gap-1.5 rounded-full uppercase tracking-wider", data?.database === 'operational' ? 'bg-emerald-500/10 text-emerald-500' : (data?.database === 'disconnected' || status === 'outage' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'))}>
                {data?.database || (status === 'loading' ? 'Checking' : 'Unknown')}
              </span>
            </div>
            <CardTitle className="text-lg mt-4">Database Cluster</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">MongoDB primary storage</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="font-bold text-foreground">Any concerns?</h3>
          <p className="text-sm text-muted-foreground mt-1">If you see a system degraded state, our engineers are likely already on it.</p>
        </div>
        <Button variant="outline">Refresh Status</Button>
      </div>
    </div>
  );
}
