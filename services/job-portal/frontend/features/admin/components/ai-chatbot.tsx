"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useFeatureCheck } from "@/hooks/use-feature-check";
import { useChat } from "../hooks/use-chat";
import { FloatingTrigger } from "./feature/floating-trigger";
import { ChatWindow } from "./feature/chat-window";

export function AiChatbot() {
  const { isAllowed, loading } = useFeatureCheck("ai-admin-bot");
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, isTyping, scrollRef, sendMessage } =
    useChat(
      "Hi! I am your AI Admin Assistant. I can help you manage users, generate reports, or create coupons. What can I do for you today?",
    );

  if (loading || !isAllowed) return null;

  return (
    <>
      {!isOpen && <FloatingTrigger onClick={() => setIsOpen(true)} />}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            onClose={() => setIsOpen(false)}
            messages={messages}
            input={input}
            isTyping={isTyping}
            scrollRef={scrollRef}
            onInputChange={setInput}
            onSend={sendMessage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
