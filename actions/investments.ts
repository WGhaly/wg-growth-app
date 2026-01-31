'use server';

import { db } from '@/lib/db';
import { investments } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema
const investmentSchema = z.object({
  type: z.enum(['stocks', 'bonds', 'crypto', 'real_estate', 'business', 'other']),
  name: z.string().min(1, 'Investment name is required').max(255),
  symbol: z.string().max(20).optional(),
  quantity: z.string().regex(/^\d+(\.\d{1,8})?$/, 'Invalid quantity format').optional(),
  purchasePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').optional(),
  currentPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').optional(),
  purchaseDate: z.string(), // ISO date string
  notes: z.string().optional(),
});

type InvestmentInput = z.infer<typeof investmentSchema>;

export async function createInvestment(data: InvestmentInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = investmentSchema.parse(data);

    const [investment] = await db.insert(investments).values({
      userId: session.user.id,
      type: validated.type,
      name: validated.name,
      symbol: validated.symbol || null,
      quantity: validated.quantity || null,
      purchasePrice: validated.purchasePrice || null,
      currentPrice: validated.currentPrice || null,
      purchaseDate: validated.purchaseDate,
      notes: validated.notes || null,
    }).returning();

    revalidatePath('/finance');
    return { success: true, data: investment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Unable to create investment. Please try again.' };
  }
}

export async function updateInvestment(id: string, data: Partial<InvestmentInput>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to update investments.' };
    }

    const validated = investmentSchema.partial().parse(data);

    const updateData: any = { updatedAt: new Date() };
    if (validated.type !== undefined) updateData.type = validated.type;
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.symbol !== undefined) updateData.symbol = validated.symbol || null;
    if (validated.quantity !== undefined) updateData.quantity = validated.quantity || null;
    if (validated.purchasePrice !== undefined) updateData.purchasePrice = validated.purchasePrice || null;
    if (validated.currentPrice !== undefined) updateData.currentPrice = validated.currentPrice || null;
    if (validated.purchaseDate !== undefined) updateData.purchaseDate = validated.purchaseDate;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;

    const [investment] = await db
      .update(investments)
      .set(updateData)
      .where(and(eq(investments.id, id), eq(investments.userId, session.user.id)))
      .returning();

    if (!investment) {
      return { success: false, error: 'Investment not found' };
    }

    revalidatePath('/finance');
    return { success: true, data: investment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Unable to update investment. Please try again.' };
  }
}

export async function deleteInvestment(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to delete investments.' };
    }

    await db
      .delete(investments)
      .where(and(eq(investments.id, id), eq(investments.userId, session.user.id)));

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unable to delete investment. Please try again.' };
  }
}

export async function getInvestments() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to view investments.' };
    }

    const allInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.userId, session.user.id))
      .orderBy(desc(investments.purchaseDate));

    return { success: true, data: allInvestments };
  } catch (error) {
    return { success: false, error: 'Unable to load investments. Please try again.' };
  }
}

export async function updateInvestmentPrice(id: string, currentPrice: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to update prices.' };
    }

    const validated = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').parse(currentPrice);

    const [investment] = await db
      .update(investments)
      .set({ 
        currentPrice: validated,
        updatedAt: new Date()
      })
      .where(and(eq(investments.id, id), eq(investments.userId, session.user.id)))
      .returning();

    if (!investment) {
      return { success: false, error: 'Investment not found' };
    }

    revalidatePath('/finance');
    return { success: true, data: investment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unable to update price. Please try again.' };
  }
}
