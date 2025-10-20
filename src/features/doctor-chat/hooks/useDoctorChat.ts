import { useCallback, useEffect, useMemo, useState } from "react";
import type { Author, ChatMessage } from "../types";
import { addMessage, clearMessages, loadMessages, saveMessages } from "../services/storage";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useDoctorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  const sorted = useMemo(() => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [messages]);

  const send = useCallback((author: Author, content: string) => {
    const msg: ChatMessage = { id: uid(), author, content: content.trim(), createdAt: new Date().toISOString() };
    const next = addMessage(msg);
    setMessages(next);
  }, []);

  const removeAll = useCallback(() => {
    clearMessages();
    setMessages([]);
  }, []);

  const importHistory = useCallback((raw: string) => {
    try {
      const data = JSON.parse(raw) as ChatMessage[];
      if (!Array.isArray(data)) return false;
      saveMessages(data);
      setMessages(data);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { messages: sorted, send, removeAll, importHistory };
}
