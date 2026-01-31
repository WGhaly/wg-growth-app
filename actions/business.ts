'use server';

import { db } from '@/lib/db';
import { companies } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema
const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  status: z.enum(['active', 'paused', 'sold', 'closed']),
  industry: z.string().max(255).optional(),
  foundedDate: z.string().optional(), // ISO date string
  closedDate: z.string().optional(), // ISO date string
  equityPercentage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid equity format (0-100)').refine(val => parseFloat(val) >= 0 && parseFloat(val) <= 100, 'Equity must be 0-100%').optional(),
  valuation: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid valuation format').optional(),
  profits: z.string().regex(/^-?\d+(\.\d{1,2})?$/, 'Invalid profits format').optional(),
  notes: z.string().optional(),
});

type CompanyInput = z.infer<typeof companySchema>;

export async function createCompany(data: CompanyInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = companySchema.parse(data);

    const [company] = await db.insert(companies).values({
      userId: session.user.id,
      name: validated.name,
      status: validated.status,
      industry: validated.industry || null,
      foundedDate: validated.foundedDate || null,
      closedDate: validated.closedDate || null,
      equityPercentage: validated.equityPercentage || null,
      valuation: validated.valuation || null,
      profits: validated.profits || null,
      notes: validated.notes || null,
    }).returning();

    revalidatePath('/business');
    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Unable to create company. Please try again.' };
  }
}

export async function updateCompany(id: string, data: Partial<CompanyInput>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = companySchema.partial().parse(data);

    const updateData: any = { updatedAt: new Date() };
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.industry !== undefined) updateData.industry = validated.industry || null;
    if (validated.foundedDate !== undefined) updateData.foundedDate = validated.foundedDate || null;
    if (validated.closedDate !== undefined) updateData.closedDate = validated.closedDate || null;
    if (validated.equityPercentage !== undefined) updateData.equityPercentage = validated.equityPercentage || null;
    if (validated.valuation !== undefined) updateData.valuation = validated.valuation || null;
    if (validated.profits !== undefined) updateData.profits = validated.profits || null;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;

    const [company] = await db
      .update(companies)
      .set(updateData)
      .where(and(eq(companies.id, id), eq(companies.userId, session.user.id)))
      .returning();

    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    revalidatePath('/business');
    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Unable to update company. Please try again.' };
  }
}

export async function deleteCompany(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await db
      .delete(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, session.user.id)));

    revalidatePath('/business');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unable to delete company. Please try again.' };
  }
}

export async function getCompanies() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const allCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, session.user.id))
      .orderBy(desc(companies.createdAt));

    return { success: true, data: allCompanies };
  } catch (error) {
    return { success: false, error: 'Failed to fetch companies' };
  }
}

export async function getCompaniesByStatus(status: 'active' | 'paused' | 'sold' | 'closed') {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const filteredCompanies = await db
      .select()
      .from(companies)
      .where(and(eq(companies.userId, session.user.id), eq(companies.status, status)))
      .orderBy(desc(companies.createdAt));

    return { success: true, data: filteredCompanies };
  } catch (error) {
    return { success: false, error: 'Failed to fetch companies' };
  }
}

export async function updateCompanyRevenue(id: string, currentRevenue: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid revenue format').parse(currentRevenue);

    const [company] = await db
      .update(companies)
      .set({ 
        currentRevenue: validated,
        updatedAt: new Date()
      })
      .where(and(eq(companies.id, id), eq(companies.userId, session.user.id)))
      .returning();

    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    revalidatePath('/business');
    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update revenue' };
  }
}
