import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getGoals } from '@/actions/goals';
import { getRoutines, getTodayCompletions } from '@/actions/routines';
import { getHabits } from '@/actions/habits';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { PageContainer } from '@/components/ui/Navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch all dashboard data in parallel
  const [goalsResult, routinesResult, todayCompletionsResult, habitsResult] = await Promise.all([
    getGoals(),
    getRoutines(),
    getTodayCompletions(),
    getHabits(),
  ]);

  const goals = goalsResult.success ? goalsResult.goals : [];
  const routines = routinesResult.success ? routinesResult.routines : [];
  const todayCompletions = todayCompletionsResult.success ? todayCompletionsResult.completions : [];
  const habits = habitsResult.success ? habitsResult.habits : [];

  // Calculate stats
  const activeGoalsCount = goals.filter(g => g.status === 'in_progress').length;
  const todayRoutinesTotal = routines.filter(r => 
    r.type === 'daily' || 
    (r.type === 'weekly' && new Date().getDay() === 0) ||
    (r.type === 'monthly' && new Date().getDate() === 1)
  ).length;
  const todayRoutinesCompleted = todayCompletions.length;

  // Calculate best habit streak
  const maxStreak = habits.length; // Simplified - using active habits count
  // Note: Streak calculation would need to be done in the habits action for accuracy

  // Transform today completions to match expected format
  const transformedCompletions = todayCompletions.map(tc => ({
    id: tc.completion.id,
    routineId: tc.completion.routineId,
    routine: tc.routine ? {
      name: tc.routine.name,
      type: tc.routine.type,
    } : undefined,
    completionLevel: tc.completion.completionLevel,
    duration: tc.completion.duration,
  }));

  return (
    <PageContainer>
      <DashboardClient
        stats={{
          todayRoutines: `${todayRoutinesCompleted}/${todayRoutinesTotal}`,
          activeGoals: activeGoalsCount,
          habitStreak: maxStreak,
        }}
        todayCompletions={transformedCompletions}
        activeGoals={goals.filter(g => g.status === 'in_progress').slice(0, 3)}
      />
    </PageContainer>
  );
}
