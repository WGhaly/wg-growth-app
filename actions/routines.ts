'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { routines, routineItems, routineCompletions } from '@/db/schema'
import { routineSchema } from '@/lib/validators'
import { auth } from '@/lib/auth'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Create a new routine
 */
export async function createRoutine(data: z.infer<typeof routineSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = routineSchema.parse(data)

    // Create routine
    const [routine] = await db.insert(routines).values({
      userId: session.user.id,
      name: validated.name,
      type: validated.type,
      minimumDuration: validated.minimumDuration,
      idealDuration: validated.idealDuration,
      targetTime: validated.targetTime,
    }).returning()

    // Create routine items if provided
    if (validated.items && validated.items.length > 0) {
      await db.insert(routineItems).values(
        validated.items.map((item) => ({
          routineId: routine.id,
          itemText: item.itemText,
          rank: item.rank,
        }))
      )
    }

    revalidatePath('/routines')
    revalidatePath('/dashboard')
    
    return { success: true, routine }
  } catch (error) {
    console.error('Create routine error:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid routine data', details: error.errors }
    }
    return { error: 'Unable to create routine. Please try again.' }
  }
}

/**
 * Update an existing routine
 */
export async function updateRoutine(
  routineId: string,
  data: Partial<z.infer<typeof routineSchema>>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify routine ownership
    const [existingRoutine] = await db
      .select()
      .from(routines)
      .where(and(eq(routines.id, routineId), eq(routines.userId, session.user.id)))
      .limit(1)

    if (!existingRoutine) {
      return { error: 'Routine not found' }
    }

    // Update routine
    const [updatedRoutine] = await db
      .update(routines)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(routines.id, routineId))
      .returning()

    // Update items if provided
    if (data.items) {
      // Delete existing items
      await db
        .delete(routineItems)
        .where(eq(routineItems.routineId, routineId))
      
      // Insert new items
      if (data.items.length > 0) {
        await db.insert(routineItems).values(
          data.items.map((item) => ({
            routineId,
            itemText: item.itemText,
            rank: item.rank,
          }))
        )
      }
    }

    revalidatePath('/routines')
    revalidatePath('/dashboard')
    
    return { success: true, routine: updatedRoutine }
  } catch (error) {
    console.error('Update routine error:', error)
    return { error: 'Unable to update routine. Please try again.' }
  }
}

/**
 * Delete a routine
 */
export async function deleteRoutine(routineId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Delete routine (cascades to items and completions)
    const [deletedRoutine] = await db
      .delete(routines)
      .where(and(eq(routines.id, routineId), eq(routines.userId, session.user.id)))
      .returning()

    if (!deletedRoutine) {
      return { error: 'Routine not found' }
    }

    revalidatePath('/routines')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Delete routine error:', error)
    return { error: 'Unable to delete routine. Please try again.' }
  }
}

/**
 * Get all routines for the current user with items
 */
export async function getRoutines() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const userRoutines = await db
      .select()
      .from(routines)
      .where(eq(routines.userId, session.user.id))
      .orderBy(desc(routines.createdAt))

    // Get items for each routine
    const routinesWithItems = await Promise.all(
      userRoutines.map(async (routine) => {
        const items = await db
          .select()
          .from(routineItems)
          .where(eq(routineItems.routineId, routine.id))
          .orderBy(routineItems.rank)
        
        return {
          ...routine,
          items,
        }
      })
    )

    return { success: true, routines: routinesWithItems }
  } catch (error) {
    console.error('Get routines error:', error)
    return { error: 'Failed to fetch routines' }
  }
}

/**
 * Get routines by type
 */
export async function getRoutinesByType(type: 'daily' | 'weekly' | 'monthly') {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const typeRoutines = await db
      .select()
      .from(routines)
      .where(and(eq(routines.userId, session.user.id), eq(routines.type, type)))
      .orderBy(desc(routines.createdAt))

    // Get items for each routine
    const routinesWithItems = await Promise.all(
      typeRoutines.map(async (routine) => {
        const items = await db
          .select()
          .from(routineItems)
          .where(eq(routineItems.routineId, routine.id))
          .orderBy(routineItems.rank)
        
        return {
          ...routine,
          items,
        }
      })
    )

    return { success: true, routines: routinesWithItems }
  } catch (error) {
    console.error('Get routines by type error:', error)
    return { error: 'Failed to fetch routines' }
  }
}

/**
 * Log routine completion
 */
export async function logRoutineCompletion(
  routineId: string,
  completionLevel: 'none' | 'minimum' | 'ideal',
  duration?: number,
  notes?: string
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify routine ownership
    const [routine] = await db
      .select()
      .from(routines)
      .where(and(eq(routines.id, routineId), eq(routines.userId, session.user.id)))
      .limit(1)

    if (!routine) {
      return { error: 'Routine not found' }
    }

    const today = new Date().toISOString().split('T')[0]

    // Create completion record
    const [completion] = await db.insert(routineCompletions).values({
      routineId,
      completionDate: today,
      completionLevel,
      duration: duration || null,
      notes: notes || null,
    }).returning()

    revalidatePath('/routines')
    revalidatePath('/dashboard')
    
    return { success: true, completion }
  } catch (error) {
    console.error('Log routine completion error:', error)
    return { error: 'Failed to log completion' }
  }
}

/**
 * Get routine completions for today
 */
export async function getTodayCompletions() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const today = new Date().toISOString().split('T')[0]

    const completions = await db
      .select({
        completion: routineCompletions,
        routine: routines,
      })
      .from(routineCompletions)
      .innerJoin(routines, eq(routineCompletions.routineId, routines.id))
      .where(and(
        eq(routines.userId, session.user.id),
        eq(routineCompletions.completionDate, today)
      ))
      .orderBy(desc(routineCompletions.createdAt))

    return { success: true, completions }
  } catch (error) {
    console.error('Get today completions error:', error)
    return { error: 'Failed to fetch completions' }
  }
}

/**
 * Get routine streak (consecutive days with completion)
 */
export async function getRoutineStreak(routineId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify routine ownership
    const [routine] = await db
      .select()
      .from(routines)
      .where(and(eq(routines.id, routineId), eq(routines.userId, session.user.id)))
      .limit(1)

    if (!routine) {
      return { error: 'Routine not found' }
    }

    // Get all completions for this routine, ordered by date descending
    const completions = await db
      .select()
      .from(routineCompletions)
      .where(eq(routineCompletions.routineId, routineId))
      .orderBy(desc(routineCompletions.completionDate))

    // Calculate streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (const completion of completions) {
      const completionDate = new Date(completion.completionDate)
      completionDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }

    return { success: true, streak }
  } catch (error) {
    console.error('Get routine streak error:', error)
    return { error: 'Failed to calculate streak' }
  }
}
