import type { JournalEntry } from "../types";

const STORAGE_KEY = "journal:entries:v1";

function safeParse(json: string | null): JournalEntry[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as JournalEntry[];
    return [];
  } catch {
    return [];
  }
}

export function loadEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveEntries(entries: JournalEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(entry: JournalEntry): JournalEntry[] {
  const current = loadEntries();
  const next = [entry, ...current];
  saveEntries(next);
  return next;
}

export function updateEntry(updated: JournalEntry): JournalEntry[] {
  const current = loadEntries();
  const next = current.map(e => (e.id === updated.id ? updated : e));
  saveEntries(next);
  return next;
}

export function deleteEntry(id: string): JournalEntry[] {
  const current = loadEntries();
  const next = current.filter(e => e.id !== id);
  saveEntries(next);
  return next;
}
