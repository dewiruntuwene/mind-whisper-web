-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'id')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table for session tracking
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  session_duration INTEGER DEFAULT 0, -- in minutes
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'id')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for conversation history
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('user', 'ai')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'id')),
  mood_indicator TEXT CHECK (mood_indicator IN ('positive', 'neutral', 'concerning')),
  energy_indicator TEXT CHECK (energy_indicator IN ('high', 'normal', 'low')),
  coherence_indicator TEXT CHECK (coherence_indicator IN ('clear', 'unclear')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wellness metrics table
CREATE TABLE public.wellness_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  mood_score INTEGER CHECK (mood_score >= 0 AND mood_score <= 100),
  mood_trend TEXT CHECK (mood_trend IN ('up', 'down', 'stable')),
  mood_status TEXT CHECK (mood_status IN ('positive', 'neutral', 'concerning')),
  energy_score INTEGER CHECK (energy_score >= 0 AND energy_score <= 100),
  energy_trend TEXT CHECK (energy_trend IN ('up', 'down', 'stable')),
  energy_status TEXT CHECK (energy_status IN ('high', 'normal', 'low')),
  coherence_score INTEGER CHECK (coherence_score >= 0 AND coherence_score <= 100),
  coherence_trend TEXT CHECK (coherence_trend IN ('up', 'down', 'stable')),
  coherence_status TEXT CHECK (coherence_status IN ('clear', 'unclear')),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  engagement_trend TEXT CHECK (engagement_trend IN ('up', 'down', 'stable')),
  engagement_status TEXT CHECK (engagement_status IN ('active', 'passive')),
  warning_flags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- RLS Policies for wellness metrics
CREATE POLICY "Users can view their own wellness metrics" 
ON public.wellness_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wellness metrics" 
ON public.wellness_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness metrics" 
ON public.wellness_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_wellness_metrics_user_id ON public.wellness_metrics(user_id);
CREATE INDEX idx_wellness_metrics_created_at ON public.wellness_metrics(created_at DESC);