'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { prayerItems } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

const prayerItemSchema = z.object({
  request: z.string().min(1, 'Prayer request is required').max(2000),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'as_needed']),
  personId: z.string().uuid().optional(),
})

/**
 * Create a new prayer item
 */
export async function createPrayerItem(data: z.infer<typeof prayerItemSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const validated = prayerItemSchema.parse(data)

    const [item] = await db.insert(prayerItems).values({
      userId: session.user.id,
      request: validated.request,
      frequency: validated.frequency,
      personId: validated.personId,
      status: 'praying',
    }).returning()

    revalidatePath('/faith')
    revalidatePath('/dashboard')
    
    return { success: true, item }
  } catch (error) {
    console.error('Create prayer item error:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid prayer item data', details: error.errors }
    }
    return { error: 'Failed to create prayer item' }
  }
}

/**
 * Update an existing prayer item
 */
export async function updatePrayerItem(
  itemId: string,
  data: Partial<z.infer<typeof prayerItemSchema>>
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const [item] = await db
      .update(prayerItems)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(prayerItems.id, itemId), eq(prayerItems.userId, session.user.id)))
      .returning()

    if (!item) {
      return { error: 'Prayer item not found' }
    }

    revalidatePath('/faith')
    revalidatePath('/dashboard')
    
    return { success: true, item }
  } catch (error) {
    console.error('Update prayer item error:', error)
    return { error: 'Failed to update prayer item' }
  }
}

/**
 * Update prayer item status
 */
export async function updatePrayerStatus(
  itemId: string,
  status: 'praying' | 'answered' | 'no_longer_relevant'
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const [item] = await db
      .update(prayerItems)
      .set({
        status,
        answeredAt: status === 'answered' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(prayerItems.id, itemId), eq(prayerItems.userId, session.user.id)))
      .returning()

    if (!item) {
      return { error: 'Prayer item not found' }
    }

    revalidatePath('/faith')
    revalidatePath('/dashboard')
    
    return { success: true, item }
  } catch (error) {
    console.error('Update prayer status error:', error)
    return { error: 'Failed to update prayer status' }
  }
}

/**
 * Delete a prayer item
 */
export async function deletePrayerItem(itemId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    await db
      .delete(prayerItems)
      .where(and(eq(prayerItems.id, itemId), eq(prayerItems.userId, session.user.id)))

    revalidatePath('/faith')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Delete prayer item error:', error)
    return { error: 'Failed to delete prayer item' }
  }
}

/**
 * Get all prayer items for the current user
 */
export async function getPrayerItems() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const items = await db
      .select()
      .from(prayerItems)
      .where(eq(prayerItems.userId, session.user.id))
      .orderBy(desc(prayerItems.createdAt))

    return { success: true, items }
  } catch (error) {
    console.error('Get prayer items error:', error)
    return { error: 'Failed to fetch prayer items' }
  }
}

/**
 * Get prayer items by status
 */
export async function getPrayerItemsByStatus(
  status: 'praying' | 'answered' | 'no_longer_relevant'
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const items = await db
      .select()
      .from(prayerItems)
      .where(and(eq(prayerItems.userId, session.user.id), eq(prayerItems.status, status)))
      .orderBy(desc(prayerItems.createdAt))

    return { success: true, items }
  } catch (error) {
    console.error('Get prayer items by status error:', error)
    return { error: 'Failed to fetch prayer items' }
  }
}
