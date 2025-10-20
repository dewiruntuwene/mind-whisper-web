export type Mood = "positive" | "neutral" | "negative";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
