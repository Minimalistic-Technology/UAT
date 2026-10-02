"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SwipeableTransactionCard, { Transaction } from "./SwipeableTransactionCard";

const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

type Tab = "new" | "pending" | "categorized";

const TABS: { key: Tab; label: string }[] = [
  { key: "new", label: "Inbox" },
  { key: "pending", label: "Pending" },
  { key: "categorized", label: "Categorized" },
];

export default function TransactionDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<Tab>("new");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);

  const loadTransactions = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/transactions/list");
      if (!res.ok) throw new Error("Failed to load transactions");
      const data = await res.json();
      setTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      setSyncing(true);
      if (!opts.silent) {
        setError(null);
        setSyncMessage(null);
      }
      try {
        const res = await fetch("/api/transactions/sync", { method: "POST" });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? `Sync failed (${res.status})`);
        if (!opts.silent) {
          setSyncMessage(
            `Scanned ${data.scanned} emails - added ${data.created}, skipped ${data.skipped}.`
          );
        }
        setLastAutoSync(new Date());
        await loadTransactions();
      } catch (err) {
        if (!opts.silent) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        setSyncing(false);
      }
    },
    [loadTransactions]
  );

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Periodically re-sync from Gmail in the background so the dashboard stays current.
  const syncingRef = useRef(syncing);
  useEffect(() => {
    syncingRef.current = syncing;
  }, [syncing]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!syncingRef.current) {
        runSync({ silent: true });
      }
    }, AUTO_SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [runSync]);

  const updateTransaction = useCallback(
    async (id: string, body: { status?: string; category?: string }) => {
      let previous: Transaction[] = [];
      // Optimistic update so the swipe feels immediate.
      setTransactions((prev) => {
        previous = prev;
        return prev.map((t) => (t._id === id ? ({ ...t, ...body } as Transaction) : t));
      });
      try {
        const res = await fetch(`/api/transactions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update transaction");
      } catch (err) {
        setTransactions(previous);
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    []
  );

  const handleMoveToPending = useCallback(
    (id: string) => updateTransaction(id, { status: "pending" }),
    [updateTransaction]
  );

  const handleCategorize = useCallback(
    (id: string, category: string) => updateTransaction(id, { status: "categorized", category }),
    [updateTransaction]
  );

  const visible = transactions.filter((t) => t.status === tab);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          Transaction emails ({transactions.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => runSync()}
            disabled={syncing}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {syncing ? "Syncing..." : "Sync from Gmail"}
          </button>
          <a
            href="/api/transactions/export"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Download Excel
          </a>
        </div>
      </div>

      {syncMessage && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{syncMessage}</p>
      )}
      {lastAutoSync && !syncMessage && (
        <p className="mt-3 text-xs text-zinc-400">
          Last synced {lastAutoSync.toLocaleTimeString()}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map(({ key, label }) => {
          const count = transactions.filter((t) => t.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-zinc-500">
            {tab === "new"
              ? 'No transactions yet. Click "Sync from Gmail" to scan your inbox.'
              : `No transactions in ${tab}.`}
          </p>
        ) : (
          visible.map((t) => (
            <SwipeableTransactionCard
              key={t._id}
              transaction={t}
              onMoveToPending={handleMoveToPending}
              onCategorize={handleCategorize}
            />
          ))
        )}
      </div>
    </div>
  );
}
