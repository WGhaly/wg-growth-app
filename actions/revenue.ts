'use server';

import { db } from '@/lib/db';
import { revenueLogs } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc, sum } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema
const revenueLogSchema = z.object({
  companyId: z.string().uuid(),
  logDate: z.string(), // ISO date string
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  notes: z.string().optional(),
});

type RevenueLogInput = z.infer<typeof revenueLogSchema>;

export async function createRevenueLog(data: RevenueLogInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = revenueLogSchema.parse(data);

    const [log] = await db.insert(revenueLogs).values({
      companyId: validated.companyId,
      logDate: validated.logDate,
      amount: validated.amount,
      notes: validated.notes || null,
    }).returning();

    revalidatePath('/business');
    return { success: true, data: log };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create revenue log' };
  }
}

export async function updateRevenueLog(id: string, data: Partial<RevenueLogInput>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = revenueLogSchema.partial().parse(data);

    const updateData: any = {};
    if (validated.logDate !== undefined) updateData.logDate = validated.logDate;
    if (validated.amount !== undefined) updateData.amount = validated.amount;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;

    const [log] = await db
      .update(revenueLogs)
      .set(updateData)
      .where(eq(revenueLogs.id, id))
      .returning();

    if (!log) {
      return { success: false, error: 'Revenue log not found' };
    }

    revalidatePath('/business');
    return { success: true, data: log };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update revenue log' };
  }
}

export async function deleteRevenueLog(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(revenueLogs).where(eq(revenueLogs.id, id));

    revalidatePath('/business');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete revenue log' };
  }
}

export async function getRevenueLogsByCompany(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const logs = await db
      .select()
      .from(revenueLogs)
      .where(eq(revenueLogs.companyId, companyId))
      .orderBy(desc(revenueLogs.logDate));

    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: 'Failed to fetch revenue logs' };
  }
}

export async function getTotalRevenue(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await db
      .select({ total: sum(revenueLogs.amount) })
      .from(revenueLogs)
      .where(eq(revenueLogs.companyId, companyId));

    const total = result[0]?.total || '0';

    return { success: true, data: total };
  } catch (error) {
    return { success: false, error: 'Failed to calculate total revenue' };
  }
}
