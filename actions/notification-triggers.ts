'use server';

import { db } from '@/lib/db';
import { habits, routines, goals, profiles } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sendPushNotification } from './notifications';

// Send habit reminders based on user preferences
export async function sendHabitReminders() {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Get all profiles with habit notifications enabled
    const profilesWithPrefs = await db
      .select()
      .from(profiles);

    for (const profile of profilesWithPrefs) {
      const prefs = profile.notificationPreferences as any;
      
      if (!prefs?.enableHabits) continue;
      
      const reminderTime = prefs.habitReminderTime || '09:00';
      
      // Check if current time matches reminder time (within 5 minute window)
      if (Math.abs(timeToMinutes(currentTime) - timeToMinutes(reminderTime)) <= 5) {
        // Get active habits for user
        const userHabits = await db
          .select()
          .from(habits)
          .where(and(
            eq(habits.userId, profile.userId),
            eq(habits.isActive, true)
          ));

        if (userHabits.length > 0) {
          await sendPushNotification(
            profile.userId,
            'Habit Reminder',
            `You have ${userHabits.length} active habit${userHabits.length > 1 ? 's' : ''} to track today`,
            { url: '/habits', type: 'habit_reminder' }
          );
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Send habit reminders error:', error);
    return { success: false, error: 'Failed to send habit reminders' };
  }
}

// Send routine reminders before scheduled time
export async function sendRoutineReminders() {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    // Get all profiles with routine notifications enabled
    const profilesWithPrefs = await db
      .select()
      .from(profiles);

    for (const profile of profilesWithPrefs) {
      const prefs = profile.notificationPreferences as any;
      
      if (!prefs?.enableRoutines) continue;
      
      const reminderBefore = prefs.routineReminderBefore || 15; // minutes

      // Get active routines with target times
      const userRoutines = await db
        .select()
        .from(routines)
        .where(and(
          eq(routines.userId, profile.userId),
          eq(routines.isActive, true)
        ));

      for (const routine of userRoutines) {
        if (!routine.targetTime) continue;

        const routineMinutes = timeToMinutes(routine.targetTime);
        const currentMinutes = timeToMinutes(currentTime);
        const minutesUntil = routineMinutes - currentMinutes;

        // Send reminder if within the reminder window
        if (minutesUntil > 0 && minutesUntil <= reminderBefore && minutesUntil >= reminderBefore - 5) {
          await sendPushNotification(
            profile.userId,
            `Routine Reminder: ${routine.name}`,
            `Starting in ${minutesUntil} minutes`,
            { url: '/routines', type: 'routine_reminder', routineId: routine.id }
          );
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Send routine reminders error:', error);
    return { success: false, error: 'Failed to send routine reminders' };
  }
}

// Send goal deadline warnings
export async function sendGoalDeadlineWarnings() {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of day

    // Get all profiles with goal notifications enabled
    const profilesWithPrefs = await db
      .select()
      .from(profiles);

    for (const profile of profilesWithPrefs) {
      const prefs = profile.notificationPreferences as any;
      
      if (!prefs?.enableGoals) continue;
      
      const warningDays = prefs.goalDeadlineWarning || 3;
      const warningDate = new Date(now);
      warningDate.setDate(warningDate.getDate() + warningDays);

      // Get goals approaching deadline
      const approachingGoals = await db
        .select()
        .from(goals)
        .where(and(
          eq(goals.userId, profile.userId),
          eq(goals.status, 'in_progress'),
          gte(goals.targetDate, now.toISOString().split('T')[0]),
          lte(goals.targetDate, warningDate.toISOString().split('T')[0])
        ));

      if (approachingGoals.length > 0) {
        for (const goal of approachingGoals) {
          if (!goal.targetDate) continue;
          
          const targetDate = new Date(goal.targetDate);
          const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          await sendPushNotification(
            profile.userId,
            `Goal Deadline Approaching`,
            `"${goal.title}" is due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
            { url: '/goals', type: 'goal_deadline', goalId: goal.id }
          );
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Send goal deadline warnings error:', error);
    return { success: false, error: 'Failed to send goal deadline warnings' };
  }
}

// Send prayer time notifications
// Note: Requires prayer times table to be implemented
export async function sendPrayerReminders() {
  try {
    // TODO: Implement when prayer times table is added to schema
    return { success: true, message: 'Prayer reminders not yet implemented' };
  } catch (error) {
    console.error('Send prayer reminders error:', error);
    return { success: false, error: 'Failed to send prayer reminders' };
  }
}

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
