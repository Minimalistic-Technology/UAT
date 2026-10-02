"use client";

import { useRef, useState } from "react";
import { TRANSACTION_CATEGORIES } from "@/lib/categories";

export interface Transaction {
  _id: string;
  subject: string;
  from: string;
  receivedAt: string;
  amount: number | null;
  currency: string | null;
  type: "debit" | "credit" | "unknown";
  merchant: string | null;
  accountLast4: string | null;
  snippet: string;
  status: "new" | "pending" | "categorized";
  category: (typeof TRANSACTION_CATEGORIES)[number] | null;
}

const TYPE_STYLES: Record<Transaction["type"], string> = {
  debit: "text-red-600 dark:text-red-400",
  credit: "text-green-600 dark:text-green-400",
  unknown: "text-zinc-500",
};

const SWIPE_THRESHOLD = 100;
const RUBBER_BAND_MAX = 48;

interface Props {
  transaction: Transaction;
  onMoveToPending: (id: string) => void;
  onCategorize: (id: string, category: string) => void;
}

export default function SwipeableTransactionCard({
  transaction,
  onMoveToPending,
  onCategorize,
}: Props) {
  const [category, setCategory] = useState<string | null>(transaction.category);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const canSwipeRight = category != null;

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - startX.current;

    if (delta > 0 && !canSwipeRight) {
      // Rubber-band: block the swipe from completing until a category is chosen.
      setDragX(Math.min(delta, RUBBER_BAND_MAX) * 0.4);
    } else {
      setDragX(delta);
    }
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);

    if (dragX <= -SWIPE_THRESHOLD) {
      onMoveToPending(transaction._id);
    } else if (dragX >= SWIPE_THRESHOLD && canSwipeRight && category) {
      onCategorize(transaction._id, category);
    }
    setDragX(0);
  }

  const bgHint =
    dragX < -20 ? "bg-amber-100 dark:bg-amber-950" : dragX > 20 && canSwipeRight ? "bg-green-100 dark:bg-green-950" : "";

  return (
    <div className={`relative overflow-hidden ${bgHint}`}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-xs font-medium">
        <span className="text-amber-700 dark:text-amber-400">← Pending</span>
        <span className={canSwipeRight ? "text-green-700 dark:text-green-400" : "text-zinc-400"}>
          {canSwipeRight ? "Categorize →" : "Pick a category first"}
        </span>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
        className="relative touch-pan-y select-none bg-white dark:bg-zinc-950 p-4 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {transaction.merchant ?? transaction.subject}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {new Date(transaction.receivedAt).toLocaleString()} · {transaction.from}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-sm font-semibold ${TYPE_STYLES[transaction.type]}`}>
              {transaction.amount != null
                ? `${transaction.type === "debit" ? "-" : transaction.type === "credit" ? "+" : ""}${
                    transaction.currency ?? ""
                  } ${transaction.amount}`
                : "—"}
            </p>
            <p className="text-xs text-zinc-400 capitalize">{transaction.type}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {TRANSACTION_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                category === c
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {!canSwipeRight && (
          <p className="mt-2 text-xs text-zinc-400">
            Select a category above to enable categorizing.
          </p>
        )}

        <div className="mt-3 flex gap-2 border-t border-zinc-100 dark:border-zinc-900 pt-3">
          <button
            type="button"
            onClick={() => onMoveToPending(transaction._id)}
            className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            Move to Pending
          </button>
          <button
            type="button"
            disabled={!canSwipeRight}
            onClick={() => category && onCategorize(transaction._id, category)}
            className="rounded-md border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
          >
            Categorize
          </button>
        </div>
      </div>
    </div>
  );
}
