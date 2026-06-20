import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorRetryBlockProps {
    error: any;
    onRetry: () => void;
    message?: string;
}

export const ErrorRetryBlock = ({ error, onRetry, message }: ErrorRetryBlockProps) => {
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to load layout data.";

    return (
        <div className="w-full h-full min-h-[150px] flex items-center justify-center p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <div className="flex flex-col items-center text-center">
                <AlertCircle size={28} className="text-red-500 mb-3" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">{message || "Connection Failed"}</h3>
                <p className="text-xs font-bold text-foreground/50 mt-1 mb-4 max-w-sm">
                    {errorMessage}
                </p>
                <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500">
                    <RefreshCw size={14} /> Retry Request
                </Button>
            </div>
        </div>
    );
};
