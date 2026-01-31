'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { lifeSeasons } from '@/db/schema';
import { lifeSeasonSchema, updateLifeSeasonSchema } from '@/lib/validators';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Create a new life season
 */
export async function createLifeSeason(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = lifeSeasonSchema.parse(data);

    // If this season is marked as current, unmark any other current seasons
    if (validatedData.isCurrent) {
      await db
        .update(lifeSeasons)
        .set({ isCurrent: false })
        .where(
          and(
            eq(lifeSeasons.userId, session.user.id),
            eq(lifeSeasons.isCurrent, true)
          )
        );
    }

    const [newSeason] = await db
      .insert(lifeSeasons)
      .values({
        userId: session.user.id,
        seasonName: validatedData.seasonName,
        description: validatedData.description,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        keyLearnings: validatedData.keyLearnings,
        definingMoments: validatedData.definingMoments,
        annualTheme: validatedData.annualTheme,
        isCurrent: validatedData.isCurrent ?? false,
      })
      .returning();

    revalidatePath('/life-seasons');
    return { success: true, data: newSeason };
  } catch (error) {
    console.error('Failed to create life season:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create life season'
    };
  }
}

/**
 * Update an existing life season
 */
export async function updateLifeSeason(id: string, data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = updateLifeSeasonSchema.parse(data);

    // If this season is being marked as current, unmark any other current seasons
    if (validatedData.isCurrent) {
      await db
        .update(lifeSeasons)
        .set({ isCurrent: false })
        .where(
          and(
            eq(lifeSeasons.userId, session.user.id),
            eq(lifeSeasons.isCurrent, true)
          )
        );
    }

    const [updatedSeason] = await db
      .update(lifeSeasons)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(lifeSeasons.id, id),
          eq(lifeSeasons.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedSeason) {
      return { success: false, error: 'Life season not found' };
    }

    revalidatePath('/life-seasons');
    return { success: true, data: updatedSeason };
  } catch (error) {
    console.error('Failed to update life season:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update life season'
    };
  }
}

/**
 * Delete a life season
 */
export async function deleteLifeSeason(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .delete(lifeSeasons)
      .where(
        and(
          eq(lifeSeasons.id, id),
          eq(lifeSeasons.userId, session.user.id)
        )
      );

    revalidatePath('/life-seasons');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete life season:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete life season'
    };
  }
}

/**
 * Get all life seasons for the current user
 */
export async function getLifeSeasons() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const seasons = await db
      .select()
      .from(lifeSeasons)
      .where(eq(lifeSeasons.userId, session.user.id))
      .orderBy(desc(lifeSeasons.startDate));

    return { success: true, data: seasons };
  } catch (error) {
    console.error('Failed to get life seasons:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get life seasons'
    };
  }
}

/**
 * Get the current life season for the user
 */
export async function getCurrentLifeSeason() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [currentSeason] = await db
      .select()
      .from(lifeSeasons)
      .where(
        and(
          eq(lifeSeasons.userId, session.user.id),
          eq(lifeSeasons.isCurrent, true)
        )
      )
      .limit(1);

    return { success: true, data: currentSeason || null };
  } catch (error) {
    console.error('Failed to get current life season:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get current life season'
    };
  }
}

/**
 * Mark a season as current (for manual override)
 */
export async function setCurrentLifeSeason(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Unmark all current seasons
    await db
      .update(lifeSeasons)
      .set({ isCurrent: false })
      .where(
        and(
          eq(lifeSeasons.userId, session.user.id),
          eq(lifeSeasons.isCurrent, true)
        )
      );

    // Mark the selected season as current
    const [updatedSeason] = await db
      .update(lifeSeasons)
      .set({ isCurrent: true, updatedAt: new Date() })
      .where(
        and(
          eq(lifeSeasons.id, id),
          eq(lifeSeasons.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedSeason) {
      return { success: false, error: 'Life season not found' };
    }

    revalidatePath('/life-seasons');
    return { success: true, data: updatedSeason };
  } catch (error) {
    console.error('Failed to set current life season:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set current life season'
    };
  }
}

/**
 * Birthday automation: Create a new season when user has a birthday
 * This should be called by a cron job or edge function
 */
export async function createBirthdaySeason(userId: string) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Get user's age from profile
    const { profiles } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!userProfile?.dateOfBirth) {
      return { success: false, error: 'User profile or date of birth not found' };
    }

    const birthDate = new Date(userProfile.dateOfBirth);
    const age = currentYear - birthDate.getFullYear();

    // Unmark current season
    await db
      .update(lifeSeasons)
      .set({ isCurrent: false })
      .where(
        and(
          eq(lifeSeasons.userId, userId),
          eq(lifeSeasons.isCurrent, true)
        )
      );

    // Create new season
    const seasonName = `Age ${age} - Year ${currentYear}`;
    const [newSeason] = await db
      .insert(lifeSeasons)
      .values({
        userId,
        seasonName,
        description: `A new chapter begins at age ${age}`,
        startDate: `${currentYear}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`,
        isCurrent: true,
      })
      .returning();

    revalidatePath('/life-seasons');
    return { success: true, data: newSeason };
  } catch (error) {
    console.error('Failed to create birthday season:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create birthday season'
    };
  }
}
