import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { JournalEntryForm } from "../components/JournalEntryForm";
import { JournalEntryList } from "../components/JournalEntryList";
import { useJournal } from "../hooks/useJournal";

export default function JournalPage() {
  const { entries, create, edit, remove, clearAll } = useJournal();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
            <h1 className="text-2xl font-bold">Journal</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearAll}>Clear All</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>Capture your thoughts and track your mood.</CardDescription>
          </CardHeader>
          <CardContent>
            <JournalEntryForm onSubmit={(t, c, m) => { create(t, c, m); }} />
          </CardContent>
        </Card>

        <JournalEntryList entries={entries} onEdit={edit} onDelete={remove} />
      </div>
    </div>
  );
}
