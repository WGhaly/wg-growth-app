'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Target, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Briefcase,
  Plus,
  Heart,
  CheckCircle
} from 'lucide-react';

interface DashboardClientProps {
  stats: {
    todayRoutines: string;
    activeGoals: number;
    habitStreak: number;
  };
  todayCompletions: Array<{
    id: string;
    routineId: string;
    routine?: {
      name: string;
      type: 'daily' | 'weekly' | 'monthly';
    };
    completionLevel: 'none' | 'minimum' | 'ideal';
    duration: number | null;
  }>;
  activeGoals: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
  }>;
}

export default function DashboardClient({ stats, todayCompletions, activeGoals }: DashboardClientProps) {
  const [currentDate] = useState(new Date());

  const categories = [
    { id: 'faith', name: 'Faith', icon: Heart, color: 'text-category-faith', href: '/faith' },
    { id: 'character', name: 'Character', icon: Target, color: 'text-category-character', href: '/goals' },
    { id: 'health', name: 'Health', icon: TrendingUp, color: 'text-category-health', href: '/routines' },
    { id: 'finance', name: 'Finance', icon: DollarSign, color: 'text-category-finance', href: '/finance' },
    { id: 'business', name: 'Business', icon: Briefcase, color: 'text-category-business', href: '/business' },
    { id: 'relationships', name: 'Relationships', icon: Users, color: 'text-category-relationships', href: '/relationships' }
  ];

  const getCompletionLevelColor = (level: 'none' | 'minimum' | 'ideal') => {
    switch (level) {
      case 'ideal': return 'text-green-400';
      case 'minimum': return 'text-yellow-400';
      case 'none': return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-text-secondary mt-1">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <Link href="/identity">
            <Button variant="secondary">
              Identity
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Today's Routines"
            value={stats.todayRoutines}
            icon={<Clock className="w-5 h-5" />}
            href="/routines"
          />
          <StatCard
            title="Active Goals"
            value={stats.activeGoals.toString()}
            icon={<Target className="w-5 h-5" />}
            href="/goals"
          />
          <StatCard
            title="Habit Streak"
            value={`${stats.habitStreak} days`}
            icon={<TrendingUp className="w-5 h-5" />}
            href="/habits"
          />
        </div>

        {/* Life Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Life Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={category.href}>
                  <div className="p-4 bg-bg-tertiary rounded-lg hover:bg-bg-secondary transition-all duration-200 cursor-pointer group">
                    <category.icon className={`w-8 h-8 ${category.color} mb-2 group-hover:scale-110 transition-transform`} />
                    <p className="text-sm font-semibold">{category.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Focus */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Routines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Routines</CardTitle>
                <Link href="/routines">
                  <Button variant="text" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayCompletions.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No routines completed today</p>
                  <Link href="/routines">
                    <Button variant="secondary" size="sm" className="mt-4">
                      <Plus size={16} className="mr-2" />
                      View Routines
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayCompletions.slice(0, 3).map((completion) => (
                    <div
                      key={completion.id}
                      className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${getCompletionLevelColor(completion.completionLevel)}`} />
                        <div>
                          <p className="font-medium">{completion.routine?.name || 'Routine'}</p>
                          <p className="text-xs text-text-secondary capitalize">
                            {completion.completionLevel} level
                            {completion.duration && ` • ${completion.duration}min`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {todayCompletions.length > 3 && (
                    <Link href="/routines">
                      <Button variant="text" size="sm" className="w-full">
                        View {todayCompletions.length - 3} more
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Goals</CardTitle>
                <Link href="/goals">
                  <Button variant="text" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active goals yet</p>
                  <Link href="/goals">
                    <Button variant="secondary" size="sm" className="mt-4">
                      <Plus size={16} className="mr-2" />
                      Set Goal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg"
                    >
                      <Target className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        <p className="text-xs text-text-secondary capitalize">
                          {goal.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/goals">
                <Button variant="secondary" className="w-full h-[44px] flex items-center justify-center">
                  <Target size={18} className="mr-2" />
                  <span>New Goal</span>
                </Button>
              </Link>
              <Link href="/routines">
                <Button variant="secondary" className="w-full h-[44px] flex items-center justify-center">
                  <Clock size={18} className="mr-2" />
                  <span>New Routine</span>
                </Button>
              </Link>
              <Link href="/habits">
                <Button variant="secondary" className="w-full h-[44px] flex items-center justify-center">
                  <TrendingUp size={18} className="mr-2" />
                  <span>Log Habit</span>
                </Button>
              </Link>
              <Link href="/identity">
                <Button variant="secondary" className="w-full h-[44px] flex items-center justify-center">
                  <Heart size={18} className="mr-2" />
                  <span>Edit Identity</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  href 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-accent transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">{title}</p>
            <div className="text-accent">{icon}</div>
          </div>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
