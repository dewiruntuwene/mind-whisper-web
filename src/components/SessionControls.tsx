import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Download,
  Share2,
  RotateCcw,
  FileText,
  Languages,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionControlsProps {
  sessionDuration: number;
  language: 'en' | 'id';
  onLanguageChange: (lang: 'en' | 'id') => void;
  onNewSession: () => void;
  onDownloadSummary: () => void;
  onShareWithTherapist: () => void;
  onSettings: () => void;
  className?: string;
}

export function SessionControls({
  sessionDuration,
  language,
  onLanguageChange,
  onNewSession,
  onDownloadSummary,
  onShareWithTherapist,
  onSettings,
  className
}: SessionControlsProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className={cn(
      "p-6 bg-card border-0 shadow-soft",
      className
    )}>
      <div className="space-y-6">
        {/* Session Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Session Control</h3>
            <p className="text-sm text-muted-foreground">
              Active for {formatDuration(sessionDuration)}
            </p>
          </div>
          <Badge variant="secondary" className="bg-status-listening/20 text-status-listening">
            Live Session
          </Badge>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
            <Languages className="w-4 h-4" />
            <span>Language</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLanguageChange('en')}
              className="flex-1"
            >
              English
            </Button>
            <Button
              variant={language === 'id' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLanguageChange('id')}
              className="flex-1"
            >
              Bahasa Indonesia
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={onNewSession}
            className="w-full justify-start space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Session</span>
          </Button>

          <Button
            variant="outline"
            onClick={onDownloadSummary}
            className="w-full justify-start space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Download Summary</span>
          </Button>

          <Button
            variant="outline"
            onClick={onShareWithTherapist}
            className="w-full justify-start space-x-2 text-primary"
          >
            <Share2 className="w-4 h-4" />
            <span>Share with Therapist</span>
          </Button>

          <Button
            variant="outline"
            onClick={onSettings}
            className="w-full justify-start space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-start space-x-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your conversations are encrypted and secure. Mental health assessments are for informational purposes only and do not replace professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
