import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Author } from "../types";

const MAX = 1000;

export function MessageInput({ onSend }: { onSend: (author: Author, content: string) => void }) {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState<Author>("user");
  const remaining = useMemo(() => MAX - content.length, [content.length]);
  const canSend = content.trim().length > 0 && content.length <= MAX;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onSend(author, content);
        setContent("");
      }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Textarea
            placeholder={author === 'user' ? "Write a message to your doctor..." : "Respond as the doctor..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant={author === 'user' ? 'default' : 'outline'} size="sm" onClick={() => setAuthor('user')}>As You</Button>
          <Button type="button" variant={author === 'doctor' ? 'default' : 'outline'} size="sm" onClick={() => setAuthor('doctor')}>As Doctor</Button>
          <Button type="submit" size="sm" disabled={!canSend}>Send</Button>
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground">{remaining}/{MAX}</div>
    </form>
  );
}
