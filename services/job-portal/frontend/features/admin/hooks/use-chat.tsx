import apiClient from "@/lib/api-client";
import { useEffect, useRef, useState } from "react";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export function useChat(initialMessage: string) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: initialMessage },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
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
      const res = await apiClient.post("/ai/chat", {
        messages: newMessages.map((m) => ({
          role: m.role === "ai" ? "assistant" : m.role,
          content: m.content,
        })),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: res.data?.data?.content || "Unexpected response format.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "Error connecting to AI service.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, input, setInput, isTyping, scrollRef, sendMessage };
}
