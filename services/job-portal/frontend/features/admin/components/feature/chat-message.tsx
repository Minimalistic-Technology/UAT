import { Sparkles, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "ai";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-slate-200 text-slate-600 dark:bg-slate-800" : "bg-indigo-100 text-indigo-600"}`}
        >
          {isUser ? <User size={14} /> : <Sparkles size={14} />}
        </div>
        <div
          className={`rounded-2xl p-3 text-sm ${isUser ? "rounded-tr-sm bg-indigo-600 text-white" : "rounded-tl-sm border border-slate-100 bg-white text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
