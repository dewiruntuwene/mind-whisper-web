import { useState, useEffect } from 'react';
import { VoiceInterface } from '@/components/VoiceInterface';
import { ConversationPanel } from '@/components/ConversationPanel';
import { WellnessIndicators } from '@/components/WellnessIndicators';
import { SessionControls } from '@/components/SessionControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Shield, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockMessages = [
  {
    id: '1',
    type: 'ai' as const,
    content: 'Hello! I\'m MindWhisper, your AI mental health companion. I\'m here to listen and support you in a safe, judgment-free space. How are you feeling today?',
    timestamp: new Date(Date.now() - 300000),
    language: 'en' as const,
  },
  {
    id: '2',
    type: 'user' as const,
    content: 'I\'ve been feeling really overwhelmed lately. Work has been stressful and I\'m having trouble sleeping.',
    timestamp: new Date(Date.now() - 240000),
    language: 'en' as const,
    indicators: {
      mood: 'concerning' as const,
      energy: 'low' as const,
      coherence: 'clear' as const,
    }
  },
  {
    id: '3',
    type: 'ai' as const,
    content: 'I hear that you\'re going through a challenging time with work stress affecting your sleep. That sounds really difficult. Can you tell me more about what specifically at work has been weighing on you?',
    timestamp: new Date(Date.now() - 180000),
    language: 'en' as const,
  }
];

const mockWellnessData = {
  overallScore: 65,
  metrics: {
    mood: { score: 45, trend: 'down' as const, status: 'concerning' as const },
    energy: { score: 35, trend: 'down' as const, status: 'low' as const },
    coherence: { score: 85, trend: 'stable' as const, status: 'clear' as const },
    engagement: { score: 70, trend: 'up' as const, status: 'active' as const },
  },
  sessionTime: 12,
  warningFlags: [
    'Sleep disruption patterns detected',
    'Stress-related language patterns',
    'Low energy indicators present'
  ]
};

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [sessionTime, setSessionTime] = useState(12);
  const [apiKey, setApiKey] = useState('');
  const [showApiDialog, setShowApiDialog] = useState(false);

  // Simulate session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartListening = () => {
    if (!apiKey) {
      setShowApiDialog(true);
      return;
    }
    setIsListening(true);
    toast({
      title: "Listening started",
      description: "Speak naturally - I'm here to listen and understand.",
    });
  };

  const handleStopListening = () => {
    setIsListening(false);
    setIsTyping(true);
    
    // Simulate AI processing and response
    setTimeout(() => {
      setIsTyping(false);
      setIsSpeaking(true);
      
      // Simulate AI speaking
      setTimeout(() => {
        setIsSpeaking(false);
      }, 3000);
    }, 2000);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Audio enabled" : "Audio muted",
      description: isMuted ? "You can now hear AI responses" : "AI responses are muted",
    });
  };

  const handleNewSession = () => {
    setSessionTime(0);
    setIsListening(false);
    setIsSpeaking(false);
    toast({
      title: "New session started",
      description: "Previous session data has been saved securely.",
    });
  };

  const handleDownloadSummary = () => {
    toast({
      title: "Summary downloaded",
      description: "Session summary saved to your downloads folder.",
    });
  };

  const handleShareWithTherapist = () => {
    toast({
      title: "Sharing prepared",
      description: "Secure link generated for therapist access.",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Voice and privacy settings will open here.",
    });
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiDialog(false);
      toast({
        title: "API Key saved",
        description: "Voice functionality is now enabled.",
      });
      handleStartListening();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-voice">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">MindWhisper</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your AI mental health companion. Speak freely in a safe, supportive space 
            designed for natural conversation and gentle psychological insights.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Voice Interface */}
          <div className="lg:col-span-1 space-y-6">
            <VoiceInterface
              isListening={isListening}
              isSpeaking={isSpeaking}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onToggleMute={handleToggleMute}
              isMuted={isMuted}
            />
            
            <SessionControls
              sessionDuration={sessionTime}
              language={language}
              onLanguageChange={setLanguage}
              onNewSession={handleNewSession}
              onDownloadSummary={handleDownloadSummary}
              onShareWithTherapist={handleShareWithTherapist}
              onSettings={handleSettings}
            />
          </div>

          {/* Center Column - Conversation */}
          <div className="lg:col-span-1">
            <ConversationPanel
              messages={mockMessages}
              isTyping={isTyping}
              className="h-[600px]"
            />
          </div>

          {/* Right Column - Wellness Indicators */}
          <div className="lg:col-span-1">
            <WellnessIndicators data={mockWellnessData} />
          </div>
        </div>

        {/* Footer */}
        <Card className="p-6 bg-gradient-calm border-0 shadow-soft">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <p className="text-sm">
                End-to-end encrypted • HIPAA compliant • Professional mental health support available
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              MindWhisper provides supportive conversation and insights but does not replace professional medical care. 
              If you're experiencing a mental health emergency, please contact emergency services immediately.
            </p>
          </div>
        </Card>

        {/* API Key Dialog */}
        <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Enable Voice Features</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To enable realistic voice conversations, please provide your ElevenLabs API key. 
                This enables high-quality text-to-speech for natural AI responses.
              </p>
              <Input
                type="password"
                placeholder="Enter your ElevenLabs API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowApiDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                  Enable Voice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;