"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFeatureCheck } from "@/hooks/use-feature-check";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export function AiChatbot() {
  const { isAllowed, loading } = useFeatureCheck("ai-admin-bot");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hi! I am your AI Admin Assistant. I can help you manage users, generate reports, or create coupons. What can I do for you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading || !isAllowed) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await api.post("/ai/chat", {
        messages: newMessages.map((m) => ({
          role: m.role === "ai" ? "assistant" : m.role,
          content: m.content,
        })),
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: res.data?.data?.content || "Unexpected response format.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Chat failed:", error);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Error connecting to AI service.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Sparkle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-6 z-50 flex size-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition-colors hover:bg-indigo-700 lg:right-10 lg:bottom-10"
        >
          <Sparkles className="size-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
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
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>

            {/* Chat Area */}
            <div
              className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/50"
              ref={scrollRef}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[85%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-slate-200 text-slate-600 dark:bg-slate-800" : "bg-indigo-100 text-indigo-600"}`}
                    >
                      {msg.role === "user" ? (
                        <User size={14} />
                      ) : (
                        <Sparkles size={14} />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-3 text-sm ${msg.role === "user" ? "rounded-tr-sm bg-indigo-600 text-white" : "rounded-tl-sm border border-slate-100 bg-white text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
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
              )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <form
                className="flex items-center gap-2 rounded-full border border-transparent bg-slate-100 px-2 py-1.5 transition-colors focus-within:border-indigo-500/50 dark:bg-slate-900"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input
                  type="text"
                  placeholder="Ask me to do something..."
                  className="flex-1 border-none bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
        )}
      </AnimatePresence>
    </>
  );
}
