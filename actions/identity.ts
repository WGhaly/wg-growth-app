'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { users, coreValues, userYears } from '@/db/schema'
import { valueSchema } from '@/lib/validators'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Update user's manifesto
 */
export async function updateManifesto(manifesto: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Update user manifesto
    const [user] = await db
      .update(users)
      .set({
        manifesto,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning()

    if (!user) {
      return { error: 'User not found' }
    }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    
    return { success: true, manifesto: user.manifesto }
  } catch (error) {
    console.error('Update manifesto error:', error)
    return { error: 'Failed to update manifesto' }
  }
}

/**
 * Get user's manifesto
 */
export async function getManifesto() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const [user] = await db
      .select({ manifesto: users.manifesto })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    return { success: true, manifesto: user?.manifesto || null }
  } catch (error) {
    console.error('Get manifesto error:', error)
    return { error: 'Failed to fetch manifesto' }
  }
}

/**
 * Create or update a core value
 */
export async function saveValue(data: z.infer<typeof valueSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const validated = valueSchema.parse(data)

    if (validated.id) {
      // Update existing value
      const [value] = await db
        .update(coreValues)
        .set({
          value: validated.value,
          description: validated.description,
          rank: validated.rank,
          updatedAt: new Date(),
        })
        .where(and(eq(coreValues.id, validated.id), eq(coreValues.userId, session.user.id)))
        .returning()

      if (!value) {
        return { error: 'Value not found' }
      }

      revalidatePath('/profile')
      revalidatePath('/dashboard')
      
      return { success: true, value }
    } else {
      // Create new value
      const [value] = await db.insert(coreValues).values({
        userId: session.user.id,
        value: validated.value,
        description: validated.description,
        rank: validated.rank,
      }).returning()

      revalidatePath('/profile')
      revalidatePath('/dashboard')
      
      return { success: true, value }
    }
  } catch (error) {
    console.error('Save value error:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid value data', details: error.errors }
    }
    return { error: 'Failed to save value' }
  }
}

/**
 * Delete a core value
 */
export async function deleteValue(valueId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const [deletedValue] = await db
      .delete(coreValues)
      .where(and(eq(coreValues.id, valueId), eq(coreValues.userId, session.user.id)))
      .returning()

    if (!deletedValue) {
      return { error: 'Value not found' }
    }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Delete value error:', error)
    return { error: 'Failed to delete value' }
  }
}

/**
 * Get user's core values
 */
export async function getValues() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const values = await db
      .select()
      .from(coreValues)
      .where(eq(coreValues.userId, session.user.id))
      .orderBy(coreValues.rank)

    return { success: true, values }
  } catch (error) {
    console.error('Get values error:', error)
    return { error: 'Failed to fetch values' }
  }
}

/**
 * Update faith commitment
 */
export async function updateFaithCommitment(faithCommitment: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Update user faith commitment
    const [user] = await db
      .update(users)
      .set({
        faithCommitment,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning()

    if (!user) {
      return { error: 'User not found' }
    }

    revalidatePath('/faith')
    revalidatePath('/profile')
    revalidatePath('/dashboard')
    
    return { success: true, faithCommitment: user.faithCommitment }
  } catch (error) {
    console.error('Update faith commitment error:', error)
    return { error: 'Failed to update faith commitment' }
  }
}

/**
 * Get faith commitment
 */
export async function getFaithCommitment() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const [user] = await db
      .select({ faithCommitment: users.faithCommitment })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    return { success: true, faithCommitment: user?.faithCommitment || null }
  } catch (error) {
    console.error('Get faith commitment error:', error)
    return { error: 'Failed to fetch faith commitment' }
  }
}

/**
 * Create or update current year theme
 */
export async function saveYearTheme(
  year: number,
  theme: string,
  description?: string
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Check if year theme exists
    const [existing] = await db
      .select()
      .from(userYears)
      .where(and(eq(userYears.userId, session.user.id), eq(userYears.year, year)))
      .limit(1)

    if (existing) {
      // Update existing
      const [yearTheme] = await db
        .update(userYears)
        .set({
          theme,
          description,
          updatedAt: new Date(),
        })
        .where(eq(userYears.id, existing.id))
        .returning()

      revalidatePath('/profile')
      revalidatePath('/dashboard')
      
      return { success: true, yearTheme }
    } else {
      // Create new
      const [yearTheme] = await db.insert(userYears).values({
        userId: session.user.id,
        year,
        theme,
        description,
      }).returning()

      revalidatePath('/profile')
      revalidatePath('/dashboard')
      
      return { success: true, yearTheme }
    }
  } catch (error) {
    console.error('Save year theme error:', error)
    return { error: 'Failed to save year theme' }
  }
}

/**
 * Get year theme
 */
export async function getYearTheme(year?: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const targetYear = year || new Date().getFullYear()

    const [yearTheme] = await db
      .select()
      .from(userYears)
      .where(and(eq(userYears.userId, session.user.id), eq(userYears.year, targetYear)))
      .limit(1)

    return { success: true, yearTheme: yearTheme || null }
  } catch (error) {
    console.error('Get year theme error:', error)
    return { error: 'Failed to fetch year theme' }
  }
}

/**
 * Get all user identity data (manifesto, values, faith commitment, current year theme)
 */
export async function getIdentityData() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    // Get user data
    const [user] = await db
      .select({
        manifesto: users.manifesto,
        faithCommitment: users.faithCommitment,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    // Get core values
    const values = await db
      .select()
      .from(coreValues)
      .where(eq(coreValues.userId, session.user.id))
      .orderBy(coreValues.rank)

    // Get current year theme
    const currentYear = new Date().getFullYear()
    const [yearTheme] = await db
      .select()
      .from(userYears)
      .where(and(eq(userYears.userId, session.user.id), eq(userYears.year, currentYear)))
      .limit(1)

    return {
      success: true,
      identity: {
        manifesto: user?.manifesto || null,
        faithCommitment: user?.faithCommitment || null,
        values: values || [],
        yearTheme: yearTheme || null,
      },
    }
  } catch (error) {
    console.error('Get identity data error:', error)
    return { error: 'Failed to fetch identity data' }
  }
}
