'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { people } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// SCHEMAS
// ============================================================================

const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  relationshipType: z.enum(['friend', 'family', 'partner', 'potential_partner', 'business_partner', 'ex', 'mentor', 'accountability']),
  circle: z.enum(['inner', 'middle', 'outer', 'distant']),
  trustLevel: z.enum(['high', 'medium', 'low', 'none']),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
});

// ============================================================================
// ACTIONS
// ============================================================================

export async function createPerson(data: z.infer<typeof personSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = personSchema.parse(data);

    const [person] = await db.insert(people).values({
      userId: session.user.id,
      firstName: validated.firstName,
      lastName: validated.lastName || null,
      relationshipType: validated.relationshipType,
      circle: validated.circle,
      trustLevel: validated.trustLevel,
      dateOfBirth: validated.dateOfBirth || null,
      phoneNumber: validated.phoneNumber || null,
      email: validated.email || null,
      notes: validated.notes || null,
    }).returning();

    revalidatePath('/relationships');
    return { success: true, data: person };
  } catch (error) {
    console.error('Error creating person:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Unable to create person. Please try again.' };
  }
}

export async function updatePerson(id: string, data: Partial<z.infer<typeof personSchema>>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName || null;
    if (data.relationshipType !== undefined) updateData.relationshipType = data.relationshipType;
    if (data.circle !== undefined) updateData.circle = data.circle;
    if (data.trustLevel !== undefined) updateData.trustLevel = data.trustLevel;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth || null;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    updateData.updatedAt = new Date();

    const [person] = await db.update(people)
      .set(updateData)
      .where(and(
        eq(people.id, id),
        eq(people.userId, session.user.id)
      ))
      .returning();

    if (!person) {
      return { success: false, error: 'Person not found' };
    }

    revalidatePath('/relationships');
    return { success: true, data: person };
  } catch (error) {
    console.error('Error updating person:', error);
    return { success: false, error: 'Unable to update person. Please try again.' };
  }
}

export async function deletePerson(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(people)
      .where(and(
        eq(people.id, id),
        eq(people.userId, session.user.id)
      ));

    revalidatePath('/relationships');
    return { success: true };
  } catch (error) {
    console.error('Error deleting person:', error);
    return { success: false, error: 'Unable to delete person. Please try again.' };
  }
}

export async function getPeople() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const peopleList = await db.query.people.findMany({
      where: eq(people.userId, session.user.id),
      orderBy: [desc(people.lastContactedAt), desc(people.createdAt)],
    });

    return { success: true, data: peopleList };
  } catch (error) {
    console.error('Error fetching people:', error);
    return { success: false, error: 'Failed to fetch people' };
  }
}

export async function getPeopleByCircle(circle: 'inner' | 'middle' | 'outer' | 'distant') {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const peopleList = await db.query.people.findMany({
      where: and(
        eq(people.userId, session.user.id),
        eq(people.circle, circle)
      ),
      orderBy: [desc(people.lastContactedAt), desc(people.createdAt)],
    });

    return { success: true, data: peopleList };
  } catch (error) {
    console.error('Error fetching people by circle:', error);
    return { success: false, error: 'Failed to fetch people' };
  }
}

export async function updateLastContactedAt(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [person] = await db.update(people)
      .set({ 
        lastContactedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(people.id, id),
        eq(people.userId, session.user.id)
      ))
      .returning();

    if (!person) {
      return { success: false, error: 'Person not found' };
    }

    revalidatePath('/relationships');
    return { success: true, data: person };
  } catch (error) {
    console.error('Error updating last contacted date:', error);
    return { success: false, error: 'Failed to update last contacted date' };
  }
}
