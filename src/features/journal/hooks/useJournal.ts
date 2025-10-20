import { useCallback, useEffect, useMemo, useState } from "react";
import type { JournalEntry, Mood } from "../types";
import { addEntry, deleteEntry, loadEntries, saveEntries, updateEntry } from "../services/storage";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [entries]
  );

  const create = useCallback((title: string, content: string, mood: Mood) => {
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: newId(),
      title: title.trim(),
      content: content.trim(),
      mood,
      createdAt: now,
      updatedAt: now,
    };
    const next = addEntry(entry);
    setEntries(next);
    return entry.id;
  }, []);

  const edit = useCallback((id: string, updates: Partial<Pick<JournalEntry, "title" | "content" | "mood">>) => {
    const current = entries.find(e => e.id === id);
    if (!current) return;
    const updated: JournalEntry = {
      ...current,
      ...("title" in updates ? { title: updates.title!.trim() } : {}),
      ...("content" in updates ? { content: updates.content!.trim() } : {}),
      ...("mood" in updates ? { mood: updates.mood! } : {}),
      updatedAt: new Date().toISOString(),
    };
    const next = updateEntry(updated);
    setEntries(next);
  }, [entries]);

  const remove = useCallback((id: string) => {
    const next = deleteEntry(id);
    setEntries(next);
  }, []);

  const clearAll = useCallback(() => {
    saveEntries([]);
    setEntries([]);
  }, []);

  return { entries: sorted, create, edit, remove, clearAll };
}
