'use server';

import { db } from '@/lib/db';
import { people } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schemas
const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  relationshipType: z.enum(['friend', 'family', 'partner', 'potential_partner', 'business_partner', 'ex', 'mentor', 'accountability']),
  circle: z.enum(['inner', 'middle', 'outer', 'distant']),
  trustLevel: z.enum(['high', 'medium', 'low', 'none']),
  dateOfBirth: z.string().optional(), // ISO date string
  phoneNumber: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  notes: z.string().optional(),
});

type PersonInput = z.infer<typeof personSchema>;

export async function createPerson(data: PersonInput) {
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
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create person' };
  }
}

export async function updatePerson(id: string, data: Partial<PersonInput>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = personSchema.partial().parse(data);

    const updateData: any = {};
    if (validated.firstName !== undefined) updateData.firstName = validated.firstName;
    if (validated.lastName !== undefined) updateData.lastName = validated.lastName || null;
    if (validated.relationshipType !== undefined) updateData.relationshipType = validated.relationshipType;
    if (validated.circle !== undefined) updateData.circle = validated.circle;
    if (validated.trustLevel !== undefined) updateData.trustLevel = validated.trustLevel;
    if (validated.dateOfBirth !== undefined) updateData.dateOfBirth = validated.dateOfBirth || null;
    if (validated.phoneNumber !== undefined) updateData.phoneNumber = validated.phoneNumber || null;
    if (validated.email !== undefined) updateData.email = validated.email || null;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;
    updateData.updatedAt = new Date();

    const [person] = await db
      .update(people)
      .set(updateData)
      .where(and(eq(people.id, id), eq(people.userId, session.user.id)))
      .returning();

    if (!person) {
      return { success: false, error: 'Person not found' };
    }

    revalidatePath('/relationships');
    return { success: true, data: person };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update person' };
  }
}

export async function deletePerson(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .delete(people)
      .where(and(eq(people.id, id), eq(people.userId, session.user.id)));

    revalidatePath('/relationships');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete person' };
  }
}

export async function getPeople() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const allPeople = await db
      .select()
      .from(people)
      .where(eq(people.userId, session.user.id))
      .orderBy(desc(people.lastContactedAt), desc(people.createdAt));

    return { success: true, data: allPeople };
  } catch (error) {
    return { success: false, error: 'Failed to fetch people' };
  }
}

export async function getPeopleByCircle(circle: 'inner' | 'middle' | 'outer' | 'distant') {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const filteredPeople = await db
      .select()
      .from(people)
      .where(and(eq(people.userId, session.user.id), eq(people.circle, circle)))
      .orderBy(desc(people.lastContactedAt), desc(people.createdAt));

    return { success: true, data: filteredPeople };
  } catch (error) {
    return { success: false, error: 'Failed to fetch people' };
  }
}

export async function updateLastContacted(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [person] = await db
      .update(people)
      .set({ 
        lastContactedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(people.id, id), eq(people.userId, session.user.id)))
      .returning();

    if (!person) {
      return { success: false, error: 'Person not found' };
    }

    revalidatePath('/relationships');
    return { success: true, data: person };
  } catch (error) {
    return { success: false, error: 'Failed to update contact date' };
  }
}
