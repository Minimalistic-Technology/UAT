"use client";

import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/admin/subscribers")
      .then((res) => {
        if (!isMounted) return;
        setSubscribers(res.data.data || []);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative h-10 w-10">
          <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="bg-theme-element border-theme-accent/20 overflow-hidden rounded-[2rem] border shadow-sm">
        <div className="border-theme-accent/10 flex items-center justify-between border-b p-6 sm:p-8">
          <div>
            <h3 className="text-foreground mb-1 flex items-center gap-2 text-xl font-black">
              <Mail size={20} className="text-theme-action" />
              Newsletter Subscribers
            </h3>
            <p className="text-foreground/50 text-xs font-bold tracking-widest uppercase">
              Total Active Audience: {subscribers.length}
            </p>
          </div>
        </div>
        <div className="p-6">
          {subscribers.length === 0 ? (
            <div className="border-theme-accent/20 rounded-2xl border-2 border-dashed py-12 text-center">
              <p className="text-foreground/50 mb-2 font-semibold">
                No subscribers found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscribers.map((sub: any) => (
                <div
                  key={sub.id}
                  className="bg-background border-theme-accent/10 hover:border-theme-action/30 flex items-center gap-4 rounded-xl border p-4 shadow-sm transition-all"
                >
                  <div className="bg-theme-element-sec border-theme-accent/20 text-foreground group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border font-black">
                    <div className="bg-theme-action absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10" />
                    {sub.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-black">
                      {sub.email}
                    </p>
                    <p className="text-foreground/40 mt-1 text-[10px] font-bold tracking-widest uppercase">
                      Joined{" "}
                      {formatDistanceToNow(new Date(sub.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
