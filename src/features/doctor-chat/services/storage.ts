import type { ChatMessage } from "../types";

const STORAGE_KEY = "doctor-chat:messages:v1";

function safeParse(raw: string | null): ChatMessage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ChatMessage[];
    return [];
  } catch {
    return [];
  }
}

export function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function addMessage(message: ChatMessage): ChatMessage[] {
  const next = [...loadMessages(), message];
  saveMessages(next);
  return next;
}

export function clearMessages(): void {
  saveMessages([]);
}
