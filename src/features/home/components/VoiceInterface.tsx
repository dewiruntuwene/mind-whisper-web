import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInterfaceProps {
  isListening: boolean;
  isSpeaking: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  className?: string;
}

export function VoiceInterface({
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onToggleMute,
  isMuted,
  className
}: VoiceInterfaceProps) {
  const [volume, setVolume] = useState(0);
  const volumeRef = useRef<number>(0);

  useEffect(() => {
    let animationId: number;

    if (isListening || isSpeaking) {
      const animate = () => {
        volumeRef.current = Math.random() * 100;
        setVolume(volumeRef.current);
        animationId = requestAnimationFrame(animate);
      };
      animate();
    } else {
      setVolume(0);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isListening, isSpeaking]);

  const getStatusColor = () => {
    if (isSpeaking) return 'status-speaking';
    if (isListening) return 'status-listening';
    return 'muted';
  };

  const getStatusText = () => {
    if (isSpeaking) return 'AI is speaking...';
    if (isListening) return 'Listening...';
    return 'Ready to listen';
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-voice border-0 shadow-medium",
      className
    )}>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center">
          <div className={cn(
            "absolute inset-0 rounded-full border-4 transition-all duration-300",
            `border-${getStatusColor()}`,
            (isListening || isSpeaking) && "animate-pulse"
          )}>
            <div 
              className={cn(
                "absolute inset-2 rounded-full transition-all duration-75",
                `bg-${getStatusColor()}`
              )}
              style={{
                opacity: Math.max(0.2, volume / 100),
                transform: `scale(${Math.max(0.8, 0.8 + (volume / 500))})`
              }}
            />
          </div>

          <div className={cn(
            "relative z-10 p-4 rounded-full bg-card/80 backdrop-blur-sm shadow-soft transition-all duration-300",
            (isListening || isSpeaking) && "scale-110"
          )}>
            {isListening ? (
              <Mic className="w-8 h-8 text-status-listening" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-status-speaking" />
            ) : (
              <MicOff className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="text-center">
          <p className={cn(
            "text-lg font-medium transition-colors duration-300",
            `text-${getStatusColor()}`
          )}>
            {getStatusText()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tap to {isListening ? 'stop' : 'start'} conversation
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMute}
            className={cn(
              "rounded-full border-input-border",
              isMuted && "bg-destructive/10 text-destructive"
            )}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Button
            onClick={isListening ? onStopListening : onStartListening}
            disabled={isSpeaking}
            className={cn(
              "rounded-full px-8 py-3 text-base font-medium transition-all duration-300",
              isListening 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-primary hover:bg-primary/90 shadow-strong"
            )}
          >
            {isListening ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Conversation
              </>
            )}
          </Button>

          <Button variant="outline" size="icon" className="rounded-full border-input-border" disabled>
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
