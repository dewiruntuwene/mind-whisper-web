import { useMemo, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import type { Mood } from "../types";

const MAX_CHARS = 1000;

export function JournalEntryForm({ onSubmit }: { onSubmit: (title: string, content: string, mood: Mood) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");

  const remaining = useMemo(() => MAX_CHARS - content.length, [content.length]);
  const disabled = title.trim().length === 0 || content.trim().length === 0 || content.length > MAX_CHARS;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        onSubmit(title, content, mood);
        setTitle("");
        setContent("");
        setMood("neutral");
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="journal-title">Title</Label>
        <Input
          id="journal-title"
          placeholder="A short title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-content">Entry</Label>
        <Textarea
          id="journal-content"
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-32"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Choose mood:</span>
          <div className="flex gap-2">
            {(["positive","neutral","negative"] as Mood[]).map(m => (
              <Button
                key={m}
                type="button"
                variant={mood === m ? "default" : "outline"}
                size="sm"
                onClick={() => setMood(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">{remaining}/{MAX_CHARS}</div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled}>Save Entry</Button>
      </div>
    </form>
  );
}
