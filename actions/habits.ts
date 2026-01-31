'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { habits, habitLogs } from '@/db/schema'
import { habitSchema } from '@/lib/validators'
import { auth } from '@/lib/auth'
import { eq, and, desc, gte } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Create a new habit
 */
export async function createHabit(data: z.infer<typeof habitSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = habitSchema.parse(data)

    // Create habit
    const [habit] = await db.insert(habits).values({
      userId: session.user.id,
      type: validated.type,
      name: validated.name,
      measurement: validated.measurement,
      targetValue: validated.targetValue,
      startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    }).returning()

    revalidatePath('/habits')
    revalidatePath('/dashboard')
    
    return { success: true, habit }
  } catch (error) {
    console.error('Create habit error:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid habit data', details: error.errors }
    }
    return { error: 'Unable to create habit. Please try again.' }
  }
}

/**
 * Update an existing habit
 */
export async function updateHabit(
  habitId: string,
  data: Partial<z.infer<typeof habitSchema>>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify habit ownership
    const [existingHabit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)))
      .limit(1)

    if (!existingHabit) {
      return { error: 'Habit not found' }
    }

    // Update habit
    const [updatedHabit] = await db
      .update(habits)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(habits.id, habitId))
      .returning()

    revalidatePath('/habits')
    revalidatePath('/dashboard')
    
    return { success: true, habit: updatedHabit }
  } catch (error) {
    console.error('Update habit error:', error)
    return { error: 'Unable to update habit. Please try again.' }
  }
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Delete habit (cascades to logs)
    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)))
      .returning()

    if (!deletedHabit) {
      return { error: 'Habit not found' }
    }

    revalidatePath('/habits')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Delete habit error:', error)
    return { error: 'Unable to delete habit. Please try again.' }
  }
}

/**
 * Get all habits for the current user
 */
export async function getHabits() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, session.user.id))
      .orderBy(desc(habits.createdAt))

    return { success: true, habits: userHabits }
  } catch (error) {
    console.error('Get habits error:', error)
    return { error: 'Failed to fetch habits' }
  }
}

/**
 * Get habits by type (good or bad)
 */
export async function getHabitsByType(type: 'good' | 'bad') {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const typeHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, session.user.id), eq(habits.type, type)))
      .orderBy(desc(habits.createdAt))

    return { success: true, habits: typeHabits }
  } catch (error) {
    console.error('Get habits by type error:', error)
    return { error: 'Failed to fetch habits' }
  }
}

/**
 * Log habit entry
 */
export async function logHabit(
  habitId: string,
  value: number,
  notes?: string
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify habit ownership
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)))
      .limit(1)

    if (!habit) {
      return { error: 'Habit not found' }
    }

    // Create log entry
    const [log] = await db.insert(habitLogs).values({
      habitId,
      logDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      value,
      notes,
    }).returning()

    revalidatePath('/habits')
    revalidatePath('/dashboard')
    
    return { success: true, log }
  } catch (error) {
    console.error('Log habit error:', error)
    return { error: 'Failed to log habit' }
  }
}

/**
 * Get habit logs for a specific habit
 */
export async function getHabitLogs(habitId: string, days: number = 30) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify habit ownership
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)))
      .limit(1)

    if (!habit) {
      return { error: 'Habit not found' }
    }

    // Get logs from the last N days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateString = startDate.toISOString().split('T')[0]

    const logs = await db
      .select()
      .from(habitLogs)
      .where(and(
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.logDate, startDateString)
      ))
      .orderBy(desc(habitLogs.logDate))

    return { success: true, logs }
  } catch (error) {
    console.error('Get habit logs error:', error)
    return { error: 'Failed to fetch habit logs' }
  }
}

/**
 * Get today's habit logs
 */
export async function getTodayHabitLogs() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const today = new Date().toISOString().split('T')[0]

    const logs = await db
      .select({
        log: habitLogs,
        habit: habits,
      })
      .from(habitLogs)
      .innerJoin(habits, eq(habitLogs.habitId, habits.id))
      .where(and(
        eq(habits.userId, session.user.id),
        gte(habitLogs.logDate, today)
      ))
      .orderBy(desc(habitLogs.logDate))

    return { success: true, logs }
  } catch (error) {
    console.error('Get today habit logs error:', error)
    return { error: 'Failed to fetch today\'s logs' }
  }
}

/**
 * Calculate habit streak (consecutive days with logs)
 */
export async function getHabitStreak(habitId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify habit ownership
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)))
      .limit(1)

    if (!habit) {
      return { error: 'Habit not found' }
    }

    // Get all logs for this habit, grouped by day
    const logs = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, habitId))
      .orderBy(desc(habitLogs.logDate))

    // Group logs by date
    const logsByDate = new Map<string, number>()
    logs.forEach(log => {
      const dateKey = log.logDate // Already in YYYY-MM-DD format
      
      if (!logsByDate.has(dateKey)) {
        logsByDate.set(dateKey, log.value || 0)
      } else {
        // Sum values for multiple logs on same day
        logsByDate.set(dateKey, logsByDate.get(dateKey)! + (log.value || 0))
      }
    })

    // Calculate streak based on habit type
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // For good habits: consecutive days with logs meeting target
    // For bad habits: consecutive days WITHOUT logs (or with 0 value)
    if (habit.type === 'good') {
      for (let i = 0; i < 365; i++) { // Max 365 day streak
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateKey = checkDate.toISOString().split('T')[0]
        
        const dayValue = logsByDate.get(dateKey) || 0
        const metTarget = habit.targetValue ? dayValue >= habit.targetValue : dayValue > 0
        
        if (metTarget) {
          streak++
        } else if (i > 0) { // Allow today to not be logged yet
          break
        }
      }
    } else {
      // Bad habit: count days without logs
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateKey = checkDate.toISOString().split('T')[0]
        
        const dayValue = logsByDate.get(dateKey) || 0
        
        if (dayValue === 0) {
          streak++
        } else {
          break
        }
      }
    }

    return { success: true, streak }
  } catch (error) {
    console.error('Get habit streak error:', error)
    return { error: 'Failed to calculate streak' }
  }
}
