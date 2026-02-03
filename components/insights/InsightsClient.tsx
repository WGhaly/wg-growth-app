'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MobileFilterSelect } from '@/components/ui/MobileFilterSelect';
import { RefreshCw, Filter, Sparkles } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { Card, CardContent } from '@/components/ui/Card';

interface Insight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'achievement';
  category: 'habits' | 'routines' | 'goals' | 'overall';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  data?: any;
}

interface InsightsClientProps {
  initialInsights: Insight[];
}

type FilterType = 'all' | 'pattern' | 'recommendation' | 'warning' | 'achievement';
type CategoryFilter = 'all' | 'habits' | 'routines' | 'goals' | 'overall';

export function InsightsClient({ initialInsights }: InsightsClientProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDismiss = (id: string) => {
    setInsights(insights.filter(insight => insight.id !== id));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger page reload to regenerate insights
    window.location.reload();
  };

  const filteredInsights = insights.filter(insight => {
    if (typeFilter !== 'all' && insight.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && insight.category !== categoryFilter) return false;
    return true;
  });

  const counts = {
    all: insights.length,
    pattern: insights.filter(i => i.type === 'pattern').length,
    recommendation: insights.filter(i => i.type === 'recommendation').length,
    warning: insights.filter(i => i.type === 'warning').length,
    achievement: insights.filter(i => i.type === 'achievement').length,
  };

  const categoryCounts = {
    all: insights.length,
    habits: insights.filter(i => i.category === 'habits').length,
    routines: insights.filter(i => i.category === 'routines').length,
    goals: insights.filter(i => i.category === 'goals').length,
    overall: insights.filter(i => i.category === 'overall').length,
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={28} className="text-accent-primary" />
              <h1 className="text-3xl font-bold">Insights</h1>
            </div>
            <p className="text-text-secondary mt-1">
              AI-powered analysis of your habits, routines, and goals
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Insights'}
          </Button>
        </div>

        {/* Type Filter */}
        <div className="mb-6">
          <MobileFilterSelect
            label="Insight Type"
            options={[
              { id: 'all', label: 'All Types', count: counts.all },
              { id: 'achievement', label: 'Achievement', count: counts.achievement },
              { id: 'warning', label: 'Warning', count: counts.warning },
              { id: 'recommendation', label: 'Recommendation', count: counts.recommendation },
              { id: 'pattern', label: 'Pattern', count: counts.pattern },
            ]}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as FilterType)}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <MobileFilterSelect
            label="Category"
            options={[
              { id: 'all', label: 'All Categories', count: categoryCounts.all },
              { id: 'habits', label: 'Habits', count: categoryCounts.habits },
              { id: 'routines', label: 'Routines', count: categoryCounts.routines },
              { id: 'goals', label: 'Goals', count: categoryCounts.goals },
              { id: 'overall', label: 'Overall', count: categoryCounts.overall },
            ]}
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value as CategoryFilter)}
            showAsButtons={true}
          />
        </div>

        {/* Insights Grid */}
        {filteredInsights.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredInsights.map(insight => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  {insights.length === 0 ? 'No insights yet' : 'No insights match your filters'}
                </h3>
                <p className="text-text-secondary mb-6">
                  {insights.length === 0
                    ? 'Start tracking habits, routines, and goals to get personalized insights'
                    : 'Try adjusting your filters to see more insights'}
                </p>
                {insights.length === 0 && (
                  <Button onClick={handleRefresh}>
                    <RefreshCw size={18} className="mr-2" />
                    Generate Insights
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {insights.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="py-4">
                <p className="text-sm text-text-tertiary">Achievements</p>
                <p className="text-2xl font-bold text-green-400">{counts.achievement}</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/10 border-orange-500/30">
              <CardContent className="py-4">
                <p className="text-sm text-text-tertiary">Warnings</p>
                <p className="text-2xl font-bold text-orange-400">{counts.warning}</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="py-4">
                <p className="text-sm text-text-tertiary">Recommendations</p>
                <p className="text-2xl font-bold text-yellow-400">{counts.recommendation}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="py-4">
                <p className="text-sm text-text-tertiary">Patterns</p>
                <p className="text-2xl font-bold text-blue-400">{counts.pattern}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
