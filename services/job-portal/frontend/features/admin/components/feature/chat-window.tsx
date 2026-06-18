import { RefObject } from "react";
import { motion } from "motion/react";
import { Bot, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { Message } from "../../hooks/use-chat";

interface ChatWindowProps {
  onClose: () => void;
  messages: Message[];
  input: string;
  isTyping: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatWindow({
  onClose,
  messages,
  input,
  isTyping,
  scrollRef,
  onInputChange,
  onSend,
}: ChatWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed right-6 bottom-6 isolate z-50 flex h-[500px] max-h-[80vh] w-[350px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[400px] lg:right-10 lg:bottom-10 dark:border-slate-800 dark:bg-slate-950"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between bg-indigo-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-white/20 p-1.5">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm leading-none font-bold">Admin AI</h3>
            <span className="text-[10px] tracking-wider text-indigo-200 opacity-90">
              POWERED BY LOCAL LLM
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X size={18} />
        </Button>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/50"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
        <form
          className="flex items-center gap-2 rounded-full border border-transparent bg-slate-100 px-2 py-1.5 transition-colors focus-within:border-indigo-500/50 dark:bg-slate-900"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <Input
            type="text"
            placeholder="Ask me to do something..."
            className="flex-1 border-none bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="h-8 w-8 rounded-full bg-indigo-600 shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={14} className="ml-0.5 text-white" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
