'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, AlertTriangle, Lightbulb, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InsightCardProps {
  insight: {
    id: string;
    type: 'pattern' | 'recommendation' | 'warning' | 'achievement';
    category: 'habits' | 'routines' | 'goals' | 'overall';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
    data?: any;
  };
  onDismiss?: (id: string) => void;
}

const typeConfig = {
  pattern: {
    icon: TrendingUp,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    label: 'Pattern'
  },
  recommendation: {
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    label: 'Recommendation'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    label: 'Warning'
  },
  achievement: {
    icon: Award,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    label: 'Achievement'
  }
};

const priorityConfig = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-bg-secondary0/20 text-text-tertiary border-gray-500/30'
};

const categoryLabels = {
  habits: 'Habits',
  routines: 'Routines',
  goals: 'Goals',
  overall: 'Overall'
};

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <Card className={`${config.borderColor} hover:border-accent-primary/50 transition-colors`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon size={20} className={config.color} />
            </div>
            <div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${priorityConfig[insight.priority]}`}>
                {insight.priority.toUpperCase()}
              </span>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(insight.id)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Dismiss insight"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <CardTitle className="text-lg">{insight.title}</CardTitle>
        <p className="text-sm text-text-tertiary mt-1">
          {categoryLabels[insight.category]}
        </p>
      </CardHeader>

      <CardContent>
        <p className="text-text-secondary mb-4">
          {insight.description}
        </p>

        {insight.actionable && (
          <div className="flex gap-2">
            <Button size="sm">Take Action</Button>
            <Button size="sm" variant="secondary">Learn More</Button>
          </div>
        )}

        {!insight.actionable && insight.type === 'achievement' && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">Share</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
