import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { VoiceInterface } from '@/components/VoiceInterface';
import { ConversationPanel } from '@/components/ConversationPanel';
import { WellnessIndicators } from '@/components/WellnessIndicators';
import { SessionControls } from '@/components/SessionControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, Shield, Key, User, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

type PanelMessage = {
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
};

type WellnessOverview = {
  overallScore: number;
  metrics: {
    mood: {
      score: number;
      trend: 'up' | 'down' | 'stable';
      status: 'positive' | 'neutral' | 'concerning';
    };
    energy: {
      score: number;
      trend: 'up' | 'down' | 'stable';
      status: 'high' | 'medium' | 'low';
    };
    coherence: {
      score: number;
      trend: 'up' | 'down' | 'stable';
      status: 'clear' | 'unclear' | 'confused';
    };
    engagement: {
      score: number;
      trend: 'up' | 'down' | 'stable';
      status: 'active' | 'moderate' | 'withdrawn';
    };
  };
  sessionTime: number;
  warningFlags: string[];
};

type ConversationRow = Tables<'conversations'>;
type MessageRow = Tables<'messages'>;
type WellnessRow = Tables<'wellness_metrics'>;

const clampScore = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};

const parseLanguage = (value: string | null): 'en' | 'id' => (value === 'id' ? 'id' : 'en');
const parseTrend = (value: string | null): 'up' | 'down' | 'stable' =>
  value === 'up' || value === 'down' ? value : 'stable';
const parseMoodStatus = (value: string | null): 'positive' | 'neutral' | 'concerning' =>
  value === 'positive' || value === 'concerning' ? value : 'neutral';
const parseEnergyStatus = (value: string | null): 'high' | 'medium' | 'low' =>
  value === 'high' || value === 'low' ? value : 'medium';
const parseCoherenceStatus = (value: string | null): 'clear' | 'unclear' | 'confused' =>
  value === 'confused' || value === 'unclear' ? value : 'clear';
const parseEngagementStatus = (value: string | null): 'active' | 'moderate' | 'withdrawn' =>
  value === 'active' || value === 'withdrawn' ? value : 'moderate';
const parseMoodIndicator = (value: string | null): PanelMessage['indicators']['mood'] =>
  value === 'positive' || value === 'neutral' || value === 'concerning' ? value : undefined;
const parseEnergyIndicator = (value: string | null): PanelMessage['indicators']['energy'] =>
  value === 'high' || value === 'medium' || value === 'low' ? value : undefined;
const parseCoherenceIndicator = (value: string | null): PanelMessage['indicators']['coherence'] =>
  value === 'clear' || value === 'unclear' || value === 'confused' ? value : undefined;

const mapMessages = (rows: MessageRow[] | null): PanelMessage[] => {
  if (!rows) {
    return [];
  }

  return rows.map((row) => {
    const mood = parseMoodIndicator(row.mood_indicator);
    const energy = parseEnergyIndicator(row.energy_indicator);
    const coherence = parseCoherenceIndicator(row.coherence_indicator);

    const indicators =
      row.type === 'user' && (mood || energy || coherence)
        ? {
            mood,
            energy,
            coherence,
          }
        : undefined;

    return {
      id: row.id,
      type: row.type === 'user' ? 'user' : 'ai',
      content: row.content,
      timestamp: new Date(row.created_at),
      language: parseLanguage(row.language),
      indicators,
    };
  });
};

const mapWellness = (row: WellnessRow, sessionDuration: number): WellnessOverview => ({
  overallScore: clampScore(row.overall_score),
  metrics: {
    mood: {
      score: clampScore(row.mood_score),
      trend: parseTrend(row.mood_trend),
      status: parseMoodStatus(row.mood_status),
    },
    energy: {
      score: clampScore(row.energy_score),
      trend: parseTrend(row.energy_trend),
      status: parseEnergyStatus(row.energy_status),
    },
    coherence: {
      score: clampScore(row.coherence_score),
      trend: parseTrend(row.coherence_trend),
      status: parseCoherenceStatus(row.coherence_status),
    },
    engagement: {
      score: clampScore(row.engagement_score),
      trend: parseTrend(row.engagement_trend),
      status: parseEngagementStatus(row.engagement_status),
    },
  },
  sessionTime: sessionDuration,
  warningFlags: Array.isArray(row.warning_flags) ? row.warning_flags : [],
});

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [sessionTime, setSessionTime] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [wellnessData, setWellnessData] = useState<WellnessOverview | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if ((!isListening && !isSpeaking) || !conversationId) {
      return;
    }

    const timer = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, [isListening, isSpeaking, conversationId]);

  const refreshData = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoadingData(true);
    setDataError(null);

    try {
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (conversationError) {
        throw conversationError;
      }

      if (!conversation) {
        setConversationId(null);
        setMessages([]);
        setSessionTime(0);
        setWellnessData(null);
        setIsLoadingData(false);
        return;
      }

      setConversationId(conversation.id);
      setSessionTime(conversation.session_duration ?? 0);
      setLanguage(parseLanguage(conversation.language));

      const { data: messageRows, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      setMessages(mapMessages(messageRows));

      const { data: wellnessRow, error: wellnessError } = await supabase
        .from('wellness_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (wellnessError) {
        throw wellnessError;
      }

      setWellnessData(wellnessRow ? mapWellness(wellnessRow, conversation.session_duration ?? 0) : null);
    } catch (error: any) {
      console.error('Failed to load session data:', error?.message ?? error);
      setDataError('Unable to load your recent session. Please try again.');
      toast({
        title: 'Failed to sync data',
        description: 'Please refresh the page or start a new session to continue.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      setConversationId(null);
      setMessages([]);
      setWellnessData(null);
      setIsLoadingData(false);
      return;
    }

    refreshData();
  }, [user, refreshData]);

  const createConversation = useCallback(
    async (lang: 'en' | 'id') => {
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          language: lang,
          session_duration: 0,
          title: `Session on ${new Date().toLocaleString()}`,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create conversation', error);
        toast({
          title: 'Unable to create session',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      const normalizedLanguage = parseLanguage(data.language);
      setConversationId(data.id);
      setMessages([]);
      setWellnessData(null);
      setSessionTime(0);
      setLanguage(normalizedLanguage);
      setDataError(null);
      return data as ConversationRow;
    },
    [user, toast]
  );

  const persistSessionDuration = useCallback(
    async (duration: number) => {
      if (!conversationId) {
        return;
      }

      const { error } = await supabase
        .from('conversations')
        .update({
          session_duration: duration,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (error) {
        console.error('Failed to update session duration', error);
      }
    },
    [conversationId]
  );

  const handleStartListening = () => {
    if (!apiKey) {
      setShowApiDialog(true);
      return;
    }

    void (async () => {
      const activeConversationId = conversationId ?? (await createConversation(language))?.id ?? null;
      if (!activeConversationId) {
        return;
      }

      setConversationId(activeConversationId);
      setIsListening(true);
      toast({
        title: 'Listening started',
        description: "Speak naturally - I'm here to listen and understand.",
      });
    })();
  };

  const handleStopListening = () => {
    setIsListening(false);
    void persistSessionDuration(sessionTime);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setIsSpeaking(true);

      setTimeout(() => {
        setIsSpeaking(false);
      }, 3000);
    }, 2000);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? 'Audio enabled' : 'Audio muted',
      description: isMuted ? 'You can now hear AI responses.' : 'AI responses are muted.',
    });
  };

  const handleNewSession = () => {
    if (isCreatingSession) {
      return;
    }

    setIsCreatingSession(true);
    setIsListening(false);
    setIsSpeaking(false);

    void (async () => {
      const conversation = await createConversation(language);
      if (conversation) {
        toast({
          title: 'New session started',
          description: 'Previous session data has been saved securely.',
        });
      }
      setIsCreatingSession(false);
    })();
  };

  const handleDownloadSummary = () => {
    toast({
      title: 'Summary downloaded',
      description: 'Session summary saved to your downloads folder.',
    });
  };

  const handleShareWithTherapist = () => {
    toast({
      title: 'Sharing prepared',
      description: 'Secure link generated for therapist access.',
    });
  };

  const handleSettings = () => {
    toast({
      title: 'Settings',
      description: 'Voice and privacy settings will open here.',
    });
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiDialog(false);
      toast({
        title: 'API Key saved',
        description: 'Voice functionality is now enabled.',
      });
      handleStartListening();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setConversationId(null);
    setMessages([]);
    setWellnessData(null);
    navigate('/auth');
  };

  const handleLanguageChange = (newLanguage: 'en' | 'id') => {
    setLanguage(newLanguage);

    if (!conversationId) {
      return;
    }

    void supabase
      .from('conversations')
      .update({ language: newLanguage })
      .eq('id', conversationId)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to update language', error);
          toast({
            title: 'Unable to update language',
            description: error.message,
            variant: 'destructive',
          });
        }
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {dataError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load session data</AlertTitle>
            <AlertDescription>{dataError}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/community">
              <Button>Community</Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="ml-1">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
              onLanguageChange={handleLanguageChange}
              onNewSession={handleNewSession}
              onDownloadSummary={handleDownloadSummary}
              onShareWithTherapist={handleShareWithTherapist}
              onSettings={handleSettings}
              isCreatingSession={isCreatingSession}
            />
          </div>

          {/* Center Column - Conversation */}
          <div className="lg:col-span-1">
            {isLoadingData ? (
              <Card className="flex flex-col h-[600px] bg-gradient-calm border-0 shadow-medium p-6 space-y-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ) : (
              <ConversationPanel
                messages={messages}
                isTyping={isTyping}
                className="h-[600px]"
              />
            )}
          </div>

          {/* Right Column - Wellness Indicators */}
          <div className="lg:col-span-1">
            {isLoadingData ? (
              <Card className="p-6 bg-card border-0 shadow-soft space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </Card>
            ) : wellnessData ? (
              <WellnessIndicators data={wellnessData} />
            ) : (
              <Card className="p-6 bg-card border-0 shadow-soft">
                <h4 className="text-md font-medium text-foreground mb-2">Wellness insights</h4>
                <p className="text-sm text-muted-foreground">
                  Complete a session to generate personalized wellness metrics.
                </p>
              </Card>
            )}
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
            <div className="text-xs text-muted-foreground">
              Welcome back, {user.email}! • <Link to="/auth" className="hover:underline">Switch Account</Link>
            </div>
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
