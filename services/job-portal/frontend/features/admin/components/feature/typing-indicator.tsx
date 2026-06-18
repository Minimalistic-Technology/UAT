import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Sparkles size={14} />
        </div>
        <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <span
            className="size-1.5 animate-bounce rounded-full bg-indigo-400"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="size-1.5 animate-bounce rounded-full bg-indigo-400"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="size-1.5 animate-bounce rounded-full bg-indigo-400"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
