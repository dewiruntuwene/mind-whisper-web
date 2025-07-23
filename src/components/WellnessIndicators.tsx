import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Brain, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WellnessData {
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
  sessionTime: number; // in minutes
  warningFlags: string[];
}

interface WellnessIndicatorsProps {
  data: WellnessData;
  className?: string;
}

export function WellnessIndicators({ data, className }: WellnessIndicatorsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'wellness-positive';
    if (score >= 40) return 'wellness-warning';
    return 'wellness-concern';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-wellness-positive" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-wellness-concern" />;
      default: return <Activity className="w-3 h-3 text-wellness-calm" />;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'mood': return <Heart className="w-4 h-4" />;
      case 'energy': return <Activity className="w-4 h-4" />;
      case 'coherence': return <Brain className="w-4 h-4" />;
      case 'engagement': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Wellness Score */}
      <Card className="p-6 bg-gradient-session border-0 shadow-medium">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Wellness Assessment</h3>
          
          <div className="relative">
            <div className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-500",
              `bg-${getScoreColor(data.overallScore)}/20 text-${getScoreColor(data.overallScore)}`
            )}>
              {data.overallScore}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Overall Score</p>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{data.sessionTime}m session</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Metrics */}
      <Card className="p-6 bg-card border-0 shadow-soft">
        <h4 className="text-md font-medium text-foreground mb-4">Detailed Analysis</h4>
        
        <div className="space-y-4">
          {Object.entries(data.metrics).map(([key, metric]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "p-1.5 rounded-md",
                    `bg-${getScoreColor(metric.score)}/20 text-${getScoreColor(metric.score)}`
                  )}>
                    {getMetricIcon(key)}
                  </div>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {key}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm text-muted-foreground">
                    {metric.score}%
                  </span>
                </div>
              </div>
              
              <Progress 
                value={metric.score} 
                className="h-2"
                // TODO: Add custom progress styling in component
              />
              
              <div className="flex justify-between items-center">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs border-0",
                    `bg-${getScoreColor(metric.score)}/20 text-${getScoreColor(metric.score)}`
                  )}
                >
                  {metric.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Warning Flags */}
      {data.warningFlags.length > 0 && (
        <Card className="p-6 bg-wellness-concern/10 border border-wellness-concern/30 shadow-soft">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-wellness-concern flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-wellness-concern mb-2">
                Areas of Attention
              </h4>
              <ul className="space-y-1">
                {data.warningFlags.map((flag, index) => (
                  <li key={index} className="text-sm text-foreground">
                    • {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}