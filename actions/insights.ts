'use server';

import { db } from '@/lib/db';
import { habits, habitLogs, routines, routineCompletions, goals } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

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

// Analyze habit patterns over the last 30 days
export async function analyzeHabitPatterns() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const insights: Insight[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all user habits with their logs
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, session.user.id));

    for (const habit of userHabits) {
      const logs = await db
        .select()
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.habitId, habit.id),
            gte(habitLogs.logDate, thirtyDaysAgo.toISOString().split('T')[0])
          )
        )
        .orderBy(desc(habitLogs.logDate));

      const completionRate = logs.length / 30;

      // High performer detection
      if (completionRate >= 0.8 && logs.length >= 20) {
        insights.push({
          id: `habit-achievement-${habit.id}`,
          type: 'achievement',
          category: 'habits',
          title: `${habit.name} - Consistency Champion!`,
          description: `You've logged this habit ${logs.length} times in the last 30 days (${Math.round(completionRate * 100)}% completion rate). Keep up the excellent work!`,
          priority: 'high',
          actionable: false,
          data: { habitId: habit.id, completionRate, logCount: logs.length }
        });
      }

      // Declining pattern detection
      if (logs.length >= 10) {
        const recentLogs = logs.slice(0, 10);
        const olderLogs = logs.slice(10, 20);
        if (olderLogs.length > 0 && recentLogs.length < olderLogs.length * 0.6) {
          insights.push({
            id: `habit-warning-${habit.id}`,
            type: 'warning',
            category: 'habits',
            title: `${habit.name} - Declining Activity`,
            description: `Your activity for this habit has decreased recently. You logged it ${recentLogs.length} times in the last 10 days vs ${olderLogs.length} times in the prior 10 days.`,
            priority: 'medium',
            actionable: true,
            data: { habitId: habit.id, recentCount: recentLogs.length, olderCount: olderLogs.length }
          });
        }
      }

      // Low engagement detection
      if (completionRate < 0.3 && logs.length < 9) {
        insights.push({
          id: `habit-recommendation-${habit.id}`,
          type: 'recommendation',
          category: 'habits',
          title: `${habit.name} - Needs Attention`,
          description: `This habit has only been logged ${logs.length} times in 30 days. Consider setting a specific time or trigger to make it easier to remember.`,
          priority: 'medium',
          actionable: true,
          data: { habitId: habit.id, logCount: logs.length }
        });
      }
    }

    return { success: true, data: insights };
  } catch (error) {
    return { success: false, error: 'Failed to analyze habit patterns' };
  }
}

// Analyze routine consistency
export async function analyzeRoutineConsistency() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const insights: Insight[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userRoutines = await db
      .select()
      .from(routines)
      .where(eq(routines.userId, session.user.id));

    for (const routine of userRoutines) {
      const completions = await db
        .select()
        .from(routineCompletions)
        .where(
          and(
            eq(routineCompletions.routineId, routine.id),
            gte(routineCompletions.completionDate, thirtyDaysAgo.toISOString().split('T')[0])
          )
        );

      const expectedCompletions = routine.type === 'daily' ? 30 : routine.type === 'weekly' ? 4 : 1;
      const completionRate = completions.length / expectedCompletions;

      // Perfect routine detection
      if (completionRate >= 0.95) {
        insights.push({
          id: `routine-achievement-${routine.id}`,
          type: 'achievement',
          category: 'routines',
          title: `${routine.name} - Perfect Execution!`,
          description: `You've completed this ${routine.type} routine ${completions.length} out of ${expectedCompletions} expected times. Outstanding consistency!`,
          priority: 'high',
          actionable: false,
          data: { routineId: routine.id, completionRate, completions: completions.length }
        });
      }

      // Struggling routine detection
      if (completionRate < 0.5 && completions.length > 0) {
        insights.push({
          id: `routine-warning-${routine.id}`,
          type: 'warning',
          category: 'routines',
          title: `${routine.name} - Below Target`,
          description: `This ${routine.type} routine has been completed ${completions.length} times (${Math.round(completionRate * 100)}% of expected). Consider adjusting the schedule or requirements.`,
          priority: 'high',
          actionable: true,
          data: { routineId: routine.id, completionRate, expected: expectedCompletions }
        });
      }
    }

    return { success: true, data: insights };
  } catch (error) {
    return { success: false, error: 'Failed to analyze routine consistency' };
  }
}

// Analyze goal progress
export async function analyzeGoalProgress() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const insights: Insight[] = [];

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, session.user.id));

    const now = new Date();

    for (const goal of userGoals) {
      if (goal.status === 'in_progress' && goal.targetDate) {
        const targetDate = new Date(goal.targetDate);
        const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Deadline approaching
        if (daysRemaining > 0 && daysRemaining <= 7) {
          insights.push({
            id: `goal-warning-${goal.id}`,
            type: 'warning',
            category: 'goals',
            title: `${goal.title} - Deadline Approaching`,
            description: `This goal is due in ${daysRemaining} days. Make sure you're on track to complete it on time.`,
            priority: 'high',
            actionable: true,
            data: { goalId: goal.id, daysRemaining }
          });
        }

        // Overdue goal
        if (daysRemaining < 0) {
          insights.push({
            id: `goal-warning-overdue-${goal.id}`,
            type: 'warning',
            category: 'goals',
            title: `${goal.title} - Overdue`,
            description: `This goal was due ${Math.abs(daysRemaining)} days ago. Consider updating the deadline or marking it complete/abandoned.`,
            priority: 'high',
            actionable: true,
            data: { goalId: goal.id, daysOverdue: Math.abs(daysRemaining) }
          });
        }
      }

      // Stale goals (not updated in 30+ days)
      if (goal.status === 'in_progress') {
        const daysSinceUpdate = Math.ceil((now.getTime() - new Date(goal.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate >= 30) {
          insights.push({
            id: `goal-recommendation-${goal.id}`,
            type: 'recommendation',
            category: 'goals',
            title: `${goal.title} - Check-in Needed`,
            description: `This goal hasn't been updated in ${daysSinceUpdate} days. Review your progress and update milestones.`,
            priority: 'medium',
            actionable: true,
            data: { goalId: goal.id, daysSinceUpdate }
          });
        }
      }
    }

    return { success: true, data: insights };
  } catch (error) {
    return { success: false, error: 'Failed to analyze goal progress' };
  }
}

// Generate personalized recommendations
export async function generateRecommendations() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const insights: Insight[] = [];

    // Get counts of active items
    const [habitCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(habits)
      .where(eq(habits.userId, session.user.id));

    const [routineCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(routines)
      .where(eq(routines.userId, session.user.id));

    const [goalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(goals)
      .where(and(eq(goals.userId, session.user.id), eq(goals.status, 'in_progress')));

    // System engagement recommendations
    if (habitCount.count === 0) {
      insights.push({
        id: 'recommendation-habits-empty',
        type: 'recommendation',
        category: 'overall',
        title: 'Start Tracking Habits',
        description: 'You haven\'t created any habits yet. Start with 1-2 simple habits you want to build or break.',
        priority: 'high',
        actionable: true,
        data: {}
      });
    }

    if (routineCount.count === 0) {
      insights.push({
        id: 'recommendation-routines-empty',
        type: 'recommendation',
        category: 'overall',
        title: 'Create Your First Routine',
        description: 'Routines help structure your day. Consider creating a morning or evening routine to get started.',
        priority: 'medium',
        actionable: true,
        data: {}
      });
    }

    if (goalCount.count === 0) {
      insights.push({
        id: 'recommendation-goals-empty',
        type: 'recommendation',
        category: 'overall',
        title: 'Set Your First Goal',
        description: 'Goals give you direction. Start by setting one meaningful goal for the next 90 days.',
        priority: 'medium',
        actionable: true,
        data: {}
      });
    }

    return { success: true, data: insights };
  } catch (error) {
    return { success: false, error: 'Failed to generate recommendations' };
  }
}

// Aggregate all insights
export async function getAllInsights() {
  try {
    const [habitResult, routineResult, goalResult, recommendationResult] = await Promise.all([
      analyzeHabitPatterns(),
      analyzeRoutineConsistency(),
      analyzeGoalProgress(),
      generateRecommendations()
    ]);

    const allInsights: Insight[] = [];

    if (habitResult.success && habitResult.data) allInsights.push(...habitResult.data);
    if (routineResult.success && routineResult.data) allInsights.push(...routineResult.data);
    if (goalResult.success && goalResult.data) allInsights.push(...goalResult.data);
    if (recommendationResult.success && recommendationResult.data) allInsights.push(...recommendationResult.data);

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    allInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return { success: true, data: allInsights };
  } catch (error) {
    return { success: false, error: 'Failed to generate insights' };
  }
}
