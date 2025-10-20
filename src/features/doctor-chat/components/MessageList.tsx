import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage } from "../types";
import { cn } from "@/lib/utils";

export function MessageList({ messages, className }: { messages: ChatMessage[]; className?: string }) {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  return (
    <Card className={cn("flex flex-col h-[500px] bg-card border-0 shadow-soft", className)}>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((m) => {
            const isUser = m.author === 'user';
            return (
              <div key={m.id} className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}> 
                {!isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">D</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[75%] rounded-lg p-3 text-sm shadow-soft", isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}> 
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  <div className={cn("mt-1 text-[10px] opacity-80", isUser ? "text-primary-foreground" : "text-foreground")}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
                {isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">Y</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </Card>
  );
}
