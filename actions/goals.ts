'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { goals, goalMilestones } from '@/db/schema'
import { goalSchema, goalMilestoneSchema } from '@/lib/validators'
import { auth } from '@/lib/auth'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Create a new goal
 */
export async function createGoal(data: z.infer<typeof goalSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = goalSchema.parse(data)

    // Create goal
    const [goal] = await db.insert(goals).values({
      userId: session.user.id,
      category: validated.category,
      timeHorizon: validated.timeHorizon,
      title: validated.title,
      description: validated.description || null,
      whyItMatters: validated.whyItMatters,
      successCriteria: validated.successCriteria,
      currentProgress: validated.currentProgress || 0,
      measurementMethod: validated.measurementMethod || null,
      targetDate: validated.targetDate || null,
      lifeSeasonId: validated.lifeSeasonId || null,
      status: 'not_started',
    }).returning()

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, goal }
  } catch (error) {
    console.error('Create goal error:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid goal data', details: error.errors }
    }
    return { error: 'Unable to create goal. Please try again.' }
  }
}

/**
 * Update an existing goal
 */
export async function updateGoal(
  goalId: string,
  data: Partial<z.infer<typeof goalSchema>>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify goal ownership
    const [existingGoal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id)))
      .limit(1)

    if (!existingGoal) {
      return { error: 'Goal not found' }
    }

    // Update goal
    const [updatedGoal] = await db
      .update(goals)
      .set({
        ...data,
        targetDate: data.targetDate || existingGoal.targetDate,
        updatedAt: new Date(),
      })
      .where(eq(goals.id, goalId))
      .returning()

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, goal: updatedGoal }
  } catch (error) {
    console.error('Update goal error:', error)
    return { error: 'Unable to update goal. Please try again.' }
  }
}

/**
 * Update goal status
 */
export async function updateGoalStatus(
  goalId: string,
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned'
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Update with completedAt if status is completed
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (status === 'completed') {
      updateData.completedAt = new Date()
    }

    const [updatedGoal] = await db
      .update(goals)
      .set(updateData)
      .where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id)))
      .returning()

    if (!updatedGoal) {
      return { error: 'Goal not found' }
    }

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true, goal: updatedGoal }
  } catch (error) {
    console.error('Update goal status error:', error)
    return { error: 'Failed to update goal status' }
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Delete goal (cascades to milestones)
    const [deletedGoal] = await db
      .delete(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id)))
      .returning()

    if (!deletedGoal) {
      return { error: 'Goal not found' }
    }

    revalidatePath('/goals')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Delete goal error:', error)
    return { error: 'Unable to delete goal. Please try again.' }
  }
}

/**
 * Get all goals for the current user
 */
export async function getGoals() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, session.user.id))
      .orderBy(desc(goals.createdAt))

    return { success: true, goals: userGoals }
  } catch (error) {
    console.error('Get goals error:', error)
    return { error: 'Failed to fetch goals' }
  }
}

/**
 * Get goals by category
 */
export async function getGoalsByCategory(
  category: 'faith' | 'character' | 'health' | 'finance' | 'business' | 'relationships'
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const categoryGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, session.user.id), eq(goals.category, category)))
      .orderBy(desc(goals.createdAt))

    return { success: true, goals: categoryGoals }
  } catch (error) {
    console.error('Get goals by category error:', error)
    return { error: 'Failed to fetch goals' }
  }
}

/**
 * Add a milestone to a goal
 */
export async function addMilestone(
  goalId: string,
  data: z.infer<typeof goalMilestoneSchema>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify goal ownership
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id)))
      .limit(1)

    if (!goal) {
      return { error: 'Goal not found' }
    }

    // Validate input
    const validated = goalMilestoneSchema.parse(data)

    // Create milestone
    const [milestone] = await db.insert(goalMilestones).values({
      goalId,
      title: validated.title,
      dueDate: validated.dueDate || null,
      isCompleted: false,
    }).returning()

    revalidatePath('/goals')
    
    return { success: true, milestone }
  } catch (error) {
    console.error('Add milestone error:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid milestone data', details: error.errors }
    }
    return { error: 'Failed to add milestone' }
  }
}

/**
 * Update milestone completion status
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  isCompleted: boolean
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify milestone ownership through goal
    const [milestone] = await db
      .select({
        milestone: goalMilestones,
        goal: goals,
      })
      .from(goalMilestones)
      .innerJoin(goals, eq(goalMilestones.goalId, goals.id))
      .where(and(
        eq(goalMilestones.id, milestoneId),
        eq(goals.userId, session.user.id)
      ))
      .limit(1)

    if (!milestone) {
      return { error: 'Milestone not found' }
    }

    // Update milestone
    const [updatedMilestone] = await db
      .update(goalMilestones)
      .set({
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      })
      .where(eq(goalMilestones.id, milestoneId))
      .returning()

    revalidatePath('/goals')
    
    return { success: true, milestone: updatedMilestone }
  } catch (error) {
    console.error('Update milestone status error:', error)
    return { error: 'Failed to update milestone' }
  }
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(milestoneId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Verify milestone ownership through goal
    const [milestone] = await db
      .select({
        milestone: goalMilestones,
        goal: goals,
      })
      .from(goalMilestones)
      .innerJoin(goals, eq(goalMilestones.goalId, goals.id))
      .where(and(
        eq(goalMilestones.id, milestoneId),
        eq(goals.userId, session.user.id)
      ))
      .limit(1)

    if (!milestone) {
      return { error: 'Milestone not found' }
    }

    // Delete milestone
    await db
      .delete(goalMilestones)
      .where(eq(goalMilestones.id, milestoneId))

    revalidatePath('/goals')
    
    return { success: true }
  } catch (error) {
    console.error('Delete milestone error:', error)
    return { error: 'Failed to delete milestone' }
  }
}
