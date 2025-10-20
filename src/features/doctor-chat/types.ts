export type Author = "user" | "doctor";

export interface ChatMessage {
  id: string;
  author: Author;
  content: string;
  createdAt: string; // ISO
}
