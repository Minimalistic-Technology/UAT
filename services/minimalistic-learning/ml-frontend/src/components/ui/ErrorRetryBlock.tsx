import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorRetryBlockProps {
  error: any;
  onRetry: () => void;
  message?: string;
}

export const ErrorRetryBlock = ({
  error,
  onRetry,
  message,
}: ErrorRetryBlockProps) => {
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load layout data.";

  return (
    <div className="flex h-full min-h-[150px] w-full items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/5 p-6">
      <div className="flex flex-col items-center text-center">
        <AlertCircle size={28} className="mb-3 text-red-500" />
        <h3 className="text-foreground text-sm font-black tracking-widest uppercase">
          {message || "Connection Failed"}
        </h3>
        <p className="text-foreground/50 mt-1 mb-4 max-w-sm text-xs font-bold">
          {errorMessage}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-red-500/30 text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
        >
          <RefreshCw size={14} /> Retry Request
        </Button>
      </div>
    </div>
  );
};
