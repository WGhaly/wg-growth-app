'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { interactions, people } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

const interactionSchema = z.object({
  personId: z.string().uuid(),
  interactionDate: z.string(),
  summary: z.string().min(1, 'Summary is required'),
  emotionalImpact: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']),
});

// ============================================================================
// ACTIONS
// ============================================================================

export async function createInteraction(data: z.infer<typeof interactionSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = interactionSchema.parse(data);

    // Verify the person belongs to the user
    const person = await db.query.people.findFirst({
      where: and(
        eq(people.id, validated.personId),
        eq(people.userId, session.user.id)
      ),
    });

    if (!person) {
      return { success: false, error: 'Person not found' };
    }

    const [interaction] = await db.insert(interactions).values({
      personId: validated.personId,
      interactionDate: new Date(validated.interactionDate),
      summary: validated.summary,
      emotionalImpact: validated.emotionalImpact,
    }).returning();

    // Update lastContactedAt on the person
    await db.update(people)
      .set({ 
        lastContactedAt: new Date(validated.interactionDate),
        updatedAt: new Date()
      })
      .where(eq(people.id, validated.personId));

    revalidatePath('/relationships');
    return { success: true, data: interaction };
  } catch (error) {
    console.error('Error creating interaction:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create interaction' };
  }
}

export async function updateInteraction(id: string, data: Partial<z.infer<typeof interactionSchema>>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // First get the interaction to verify ownership through person
    const interaction = await db.query.interactions.findFirst({
      where: eq(interactions.id, id),
      with: {
        person: true,
      },
    });

    if (!interaction || interaction.person.userId !== session.user.id) {
      return { success: false, error: 'Interaction not found' };
    }

    const updateData: any = { updatedAt: new Date() };
    if (data.interactionDate !== undefined) updateData.interactionDate = new Date(data.interactionDate);
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.emotionalImpact !== undefined) updateData.emotionalImpact = data.emotionalImpact;

    const [updatedInteraction] = await db.update(interactions)
      .set(updateData)
      .where(eq(interactions.id, id))
      .returning();

    revalidatePath('/relationships');
    return { success: true, data: updatedInteraction };
  } catch (error) {
    console.error('Error updating interaction:', error);
    return { success: false, error: 'Failed to update interaction' };
  }
}

export async function deleteInteraction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership through person
    const interaction = await db.query.interactions.findFirst({
      where: eq(interactions.id, id),
      with: {
        person: true,
      },
    });

    if (!interaction || interaction.person.userId !== session.user.id) {
      return { success: false, error: 'Interaction not found' };
    }

    await db.delete(interactions).where(eq(interactions.id, id));

    revalidatePath('/relationships');
    return { success: true };
  } catch (error) {
    console.error('Error deleting interaction:', error);
    return { success: false, error: 'Failed to delete interaction' };
  }
}

export async function getInteractionsByPerson(personId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the person belongs to the user
    const person = await db.query.people.findFirst({
      where: and(
        eq(people.id, personId),
        eq(people.userId, session.user.id)
      ),
    });

    if (!person) {
      return { success: false, error: 'Person not found' };
    }

    const interactionsList = await db.query.interactions.findMany({
      where: eq(interactions.personId, personId),
      orderBy: [desc(interactions.interactionDate)],
    });

    return { success: true, data: interactionsList };
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return { success: false, error: 'Failed to fetch interactions' };
  }
}
