import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, User, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  language?: 'en' | 'id';
  indicators?: {
    mood?: 'positive' | 'neutral' | 'concerning';
    energy?: 'high' | 'medium' | 'low';
    coherence?: 'clear' | 'unclear' | 'confused';
  };
}

interface ConversationPanelProps {
  messages: Message[];
  isTyping?: boolean;
  className?: string;
}

export function ConversationPanel({ 
  messages, 
  isTyping = false, 
  className 
}: ConversationPanelProps) {
  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'positive': return 'wellness-positive';
      case 'concerning': return 'wellness-concern';
      default: return 'wellness-calm';
    }
  };

  const getEnergyColor = (energy?: string) => {
    switch (energy) {
      case 'high': return 'status-speaking';
      case 'low': return 'wellness-concern';
      default: return 'wellness-calm';
    }
  };

  return (
    <Card className={cn(
      "flex flex-col h-full bg-gradient-calm border-0 shadow-medium",
      className
    )}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Conversation Flow</h3>
          <Badge variant="secondary" className="bg-secondary-soft">
            {messages.length} exchanges
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3 p-4 rounded-lg transition-all duration-300",
                message.type === 'ai' 
                  ? "bg-primary-soft/30 ml-8" 
                  : "bg-card mr-8 shadow-soft"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                message.type === 'ai' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}>
                {message.type === 'ai' ? (
                  <Brain className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {message.type === 'ai' ? 'MindWhisper AI' : 'You'}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.language && (
                      <Badge variant="outline" className="text-xs py-0 px-1">
                        {message.language.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-foreground leading-relaxed mb-3">
                  {message.content}
                </p>

                {/* Mental Health Indicators */}
                {message.type === 'user' && message.indicators && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-border/50">
                    {message.indicators.mood && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs border-0",
                          `bg-${getMoodColor(message.indicators.mood)}/20 text-${getMoodColor(message.indicators.mood)}`
                        )}
                      >
                        {message.indicators.mood} mood
                      </Badge>
                    )}
                    {message.indicators.energy && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs border-0",
                          `bg-${getEnergyColor(message.indicators.energy)}/20 text-${getEnergyColor(message.indicators.energy)}`
                        )}
                      >
                        {message.indicators.energy} energy
                      </Badge>
                    )}
                    {message.indicators.coherence && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs border-0",
                          message.indicators.coherence === 'clear' 
                            ? "bg-wellness-positive/20 text-wellness-positive"
                            : "bg-wellness-warning/20 text-wellness-warning"
                        )}
                      >
                        {message.indicators.coherence}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary-soft/30 ml-8 transition-all duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-foreground">MindWhisper AI</span>
                  <Badge variant="secondary" className="bg-status-processing/20 text-status-processing text-xs">
                    Processing
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}