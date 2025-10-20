import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageList } from "../components/MessageList";
import { MessageInput } from "../components/MessageInput";
import { useDoctorChat } from "../hooks/useDoctorChat";

export default function DoctorChatPage() {
  const { messages, send, removeAll } = useDoctorChat();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
            <h1 className="text-2xl font-bold">Doctor Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={removeAll}>Clear</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Private Conversation</CardTitle>
            <CardDescription>Chat securely with your doctor. This local demo supports both roles for testing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MessageList messages={messages} />
            <MessageInput onSend={send} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
