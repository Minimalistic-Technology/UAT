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
        { id: "1", role: "ai", content: "Hi! I am your AI Admin Assistant. I can help you manage users, generate reports, or create coupons. What can I do for you today?" }
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

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            const res = await api.post("/ai/chat", {
                messages: newMessages.map(m => ({
                    role: m.role === "ai" ? "assistant" : m.role,
                    content: m.content
                }))
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: res.data?.data?.content || "Unexpected response format."
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Chat failed:", error);
            const errMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: "Error connecting to AI service." };
            setMessages(prev => [...prev, errMsg]);
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
                    className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 size-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center z-50 hover:bg-indigo-700 transition-colors"
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
                        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden isolate"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-md">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none">Admin AI</h3>
                                    <span className="text-[10px] text-indigo-200 opacity-90 tracking-wider">POWERED BY LOCAL LLM</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8" onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </Button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50" ref={scrollRef}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-slate-200 dark:bg-slate-800 text-slate-600" : "bg-indigo-100 text-indigo-600"}`}>
                                            {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm shadow-sm"}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-2">
                                        <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600">
                                            <Sparkles size={14} />
                                        </div>
                                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm w-16 flex items-center justify-center gap-1 shadow-sm">
                                            <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <form
                                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-full px-2 py-1.5 border border-transparent focus-within:border-indigo-500/50 transition-colors"
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            >
                                <input
                                    type="text"
                                    placeholder="Ask me to do something..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-slate-900 dark:text-white placeholder:text-slate-400"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim()}
                                    className="h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
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
