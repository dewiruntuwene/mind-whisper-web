import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type { JournalEntry, Mood } from "../types";
import { format } from "date-fns";

export function JournalEntryList({ entries, onEdit, onDelete }: {
  entries: JournalEntry[];
  onEdit: (id: string, updates: Partial<Pick<JournalEntry, "title" | "content" | "mood">>) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftMood, setDraftMood] = useState<Mood>("neutral");

  return (
    <div className="space-y-4">
      {entries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Start your journaling by adding your first entry above.
          </CardContent>
        </Card>
      )}

      {entries.map((entry) => {
        const isEditing = editingId === entry.id;
        return (
          <Card key={entry.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex-1 text-base font-semibold">
                {isEditing ? (
                  <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} maxLength={120} />
                ) : (
                  entry.title
                )}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {format(new Date(entry.createdAt), "PPP p")} • {entry.mood}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <Textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} className="min-h-24" />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.content}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                {isEditing ? (
                  <>
                    {(["positive","neutral","negative"] as Mood[]).map(m => (
                      <Button key={m} variant={draftMood === m ? "default" : "outline"} size="sm" onClick={() => setDraftMood(m)}>{m}</Button>
                    ))}
                    <Button
                      size="sm"
                      onClick={() => {
                        onEdit(entry.id, { title: draftTitle, content: draftContent, mood: draftMood });
                        setEditingId(null);
                      }}
                    >Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingId(entry.id);
                      setDraftTitle(entry.title);
                      setDraftContent(entry.content);
                      setDraftMood(entry.mood);
                    }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(entry.id)}>Delete</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
