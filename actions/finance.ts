'use server';

import { db } from '@/lib/db';
import { financialAccounts, cashAccounts, savingsGoals } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  cashAccountSchema,
  updateCashAccountSchema,
  savingsGoalSchema,
  updateSavingsGoalSchema,
  type CashAccountInput,
  type UpdateCashAccountInput,
  type SavingsGoalInput,
  type UpdateSavingsGoalInput
} from '@/lib/validators';

// Validation schema
const accountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').max(255),
  accountType: z.string().min(1, 'Account type is required').max(100),
  balance: z.string().regex(/^-?\d+(\.\d{1,2})?$/, 'Invalid balance format'),
  currency: z.string().length(3).default('USD'),
});

type AccountInput = z.infer<typeof accountSchema>;

export async function createAccount(data: AccountInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to create financial accounts.' };
    }

    const validated = accountSchema.parse(data);

    const [account] = await db.insert(financialAccounts).values({
      userId: session.user.id,
      accountName: validated.accountName,
      accountType: validated.accountType,
      balance: validated.balance,
      currency: validated.currency,
      lastSyncedAt: new Date(),
    }).returning();

    revalidatePath('/finance');
    return { success: true, data: account };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Unable to create account. Please try again.' };
  }
}

export async function updateAccount(id: string, data: Partial<AccountInput>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to update accounts.' };
    }

    const validated = accountSchema.partial().parse(data);

    const updateData: any = { updatedAt: new Date() };
    if (validated.accountName !== undefined) updateData.accountName = validated.accountName;
    if (validated.accountType !== undefined) updateData.accountType = validated.accountType;
    if (validated.balance !== undefined) updateData.balance = validated.balance;
    if (validated.currency !== undefined) updateData.currency = validated.currency;

    const [account] = await db
      .update(financialAccounts)
      .set(updateData)
      .where(and(eq(financialAccounts.id, id), eq(financialAccounts.userId, session.user.id)))
      .returning();

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    revalidatePath('/finance');
    return { success: true, data: account };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Unable to update account. Please try again.' };
  }
}

export async function deleteAccount(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to delete accounts.' };
    }

    await db
      .delete(financialAccounts)
      .where(and(eq(financialAccounts.id, id), eq(financialAccounts.userId, session.user.id)));

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unable to delete account. Please try again.' };
  }
}

export async function getAccounts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to view accounts.' };
    }

    const accounts = await db
      .select()
      .from(financialAccounts)
      .where(eq(financialAccounts.userId, session.user.id))
      .orderBy(desc(financialAccounts.createdAt));

    return { success: true, data: accounts };
  } catch (error) {
    return { success: false, error: 'Unable to load accounts. Please try again.' };
  }
}

export async function updateAccountBalance(id: string, balance: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to update balances.' };
    }

    const validated = z.string().regex(/^-?\d+(\.\d{1,2})?$/, 'Invalid balance format').parse(balance);

    const [account] = await db
      .update(financialAccounts)
      .set({ 
        balance: validated,
        lastSyncedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(financialAccounts.id, id), eq(financialAccounts.userId, session.user.id)))
      .returning();

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    revalidatePath('/finance');
    return { success: true, data: account };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unable to update balance. Please try again.' };
  }
}

// ============================================================================
// Cash Accounts (Multi-Account Finance)
// ============================================================================

export async function createCashAccount(data: CashAccountInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const validated = cashAccountSchema.parse(data);

    const [account] = await db.insert(cashAccounts).values({
      userId: session.user.id,
      accountName: validated.accountName,
      accountType: validated.accountType,
      currentBalance: validated.currentBalance?.toString() ?? '0',
      interestRate: validated.interestRate?.toString() ?? '0',
      isActive: validated.isActive ?? true,
      notes: validated.notes ?? null
    }).returning();

    revalidatePath('/finance');
    return { success: true, account };
  } catch (error) {
    console.error('Error creating cash account:', error);
    return { error: 'Failed to create cash account' };
  }
}

export async function getCashAccounts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const accounts = await db.query.cashAccounts.findMany({
      where: eq(cashAccounts.userId, session.user.id),
      orderBy: [desc(cashAccounts.createdAt)]
    });

    const accountsWithNumbers = accounts.map(account => ({
      ...account,
      currentBalance: parseFloat(account.currentBalance)
    }));

    return { success: true, accounts: accountsWithNumbers };
  } catch (error) {
    console.error('Error fetching cash accounts:', error);
    return { error: 'Failed to fetch cash accounts' };
  }
}

export async function getActiveCashAccounts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const accounts = await db.query.cashAccounts.findMany({
      where: and(
        eq(cashAccounts.userId, session.user.id),
        eq(cashAccounts.isActive, true)
      ),
      orderBy: [desc(cashAccounts.createdAt)]
    });

    const accountsWithNumbers = accounts.map(account => ({
      ...account,
      currentBalance: parseFloat(account.currentBalance)
    }));

    return { success: true, accounts: accountsWithNumbers };
  } catch (error) {
    console.error('Error fetching active cash accounts:', error);
    return { error: 'Failed to fetch active cash accounts' };
  }
}

export async function getCashAccount(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const account = await db.query.cashAccounts.findFirst({
      where: and(
        eq(cashAccounts.id, id),
        eq(cashAccounts.userId, session.user.id)
      )
    });

    if (!account) {
      return { error: 'Account not found' };
    }

    return {
      success: true,
      account: {
        ...account,
        currentBalance: parseFloat(account.currentBalance)
      }
    };
  } catch (error) {
    console.error('Error fetching cash account:', error);
    return { error: 'Failed to fetch cash account' };
  }
}

export async function updateCashAccount(id: string, data: UpdateCashAccountInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const validated = updateCashAccountSchema.parse(data);

    const existing = await db.query.cashAccounts.findFirst({
      where: and(
        eq(cashAccounts.id, id),
        eq(cashAccounts.userId, session.user.id)
      )
    });

    if (!existing) {
      return { error: 'Account not found' };
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (validated.accountName !== undefined) updateData.accountName = validated.accountName;
    if (validated.accountType !== undefined) updateData.accountType = validated.accountType;
    if (validated.currentBalance !== undefined) updateData.currentBalance = validated.currentBalance.toString();
    if (validated.interestRate !== undefined) updateData.interestRate = validated.interestRate.toString();
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    if (validated.notes !== undefined) updateData.notes = validated.notes;

    const [updated] = await db
      .update(cashAccounts)
      .set(updateData)
      .where(eq(cashAccounts.id, id))
      .returning();

    revalidatePath('/finance');
    return {
      success: true,
      account: {
        ...updated,
        currentBalance: parseFloat(updated.currentBalance)
      }
    };
  } catch (error) {
    console.error('Error updating cash account:', error);
    return { error: 'Failed to update cash account' };
  }
}

export async function deleteCashAccount(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const existing = await db.query.cashAccounts.findFirst({
      where: and(
        eq(cashAccounts.id, id),
        eq(cashAccounts.userId, session.user.id)
      )
    });

    if (!existing) {
      return { error: 'Account not found' };
    }

    await db.delete(cashAccounts).where(eq(cashAccounts.id, id));

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Error deleting cash account:', error);
    return { error: 'Failed to delete cash account' };
  }
}

// ============================================================================
// Savings Goals
// ============================================================================

export async function createSavingsGoal(data: SavingsGoalInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const validated = savingsGoalSchema.parse(data);

    const [goal] = await db.insert(savingsGoals).values({
      userId: session.user.id,
      goalName: validated.goalName,
      targetAmount: validated.targetAmount.toString(),
      currentAmount: validated.currentAmount?.toString() ?? '0',
      targetDate: validated.targetDate ?? null,
      isActive: validated.isActive ?? true,
      notes: validated.notes ?? null
    }).returning();

    revalidatePath('/finance');
    return { success: true, goal };
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return { error: 'Failed to create savings goal' };
  }
}

export async function getSavingsGoals() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const goals = await db.query.savingsGoals.findMany({
      where: eq(savingsGoals.userId, session.user.id),
      orderBy: [desc(savingsGoals.createdAt)]
    });

    const goalsWithNumbers = goals.map(goal => ({
      ...goal,
      targetAmount: parseFloat(goal.targetAmount),
      currentAmount: parseFloat(goal.currentAmount),
      progress: (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100
    }));

    return { success: true, goals: goalsWithNumbers };
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return { error: 'Failed to fetch savings goals' };
  }
}

export async function getActiveSavingsGoals() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const goals = await db.query.savingsGoals.findMany({
      where: and(
        eq(savingsGoals.userId, session.user.id),
        eq(savingsGoals.isActive, true)
      ),
      orderBy: [desc(savingsGoals.createdAt)]
    });

    const goalsWithNumbers = goals.map(goal => ({
      ...goal,
      targetAmount: parseFloat(goal.targetAmount),
      currentAmount: parseFloat(goal.currentAmount),
      progress: (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100
    }));

    return { success: true, goals: goalsWithNumbers };
  } catch (error) {
    console.error('Error fetching active savings goals:', error);
    return { error: 'Failed to fetch active savings goals' };
  }
}

export async function getSavingsGoal(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const goal = await db.query.savingsGoals.findFirst({
      where: and(
        eq(savingsGoals.id, id),
        eq(savingsGoals.userId, session.user.id)
      )
    });

    if (!goal) {
      return { error: 'Goal not found' };
    }

    return {
      success: true,
      goal: {
        ...goal,
        targetAmount: parseFloat(goal.targetAmount),
        currentAmount: parseFloat(goal.currentAmount),
        progress: (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100
      }
    };
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    return { error: 'Failed to fetch savings goal' };
  }
}

export async function updateSavingsGoal(id: string, data: UpdateSavingsGoalInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const validated = updateSavingsGoalSchema.parse(data);

    const existing = await db.query.savingsGoals.findFirst({
      where: and(
        eq(savingsGoals.id, id),
        eq(savingsGoals.userId, session.user.id)
      )
    });

    if (!existing) {
      return { error: 'Goal not found' };
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (validated.goalName !== undefined) updateData.goalName = validated.goalName;
    if (validated.targetAmount !== undefined) updateData.targetAmount = validated.targetAmount.toString();
    if (validated.currentAmount !== undefined) updateData.currentAmount = validated.currentAmount.toString();
    if (validated.targetDate !== undefined) updateData.targetDate = validated.targetDate;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    if (validated.notes !== undefined) updateData.notes = validated.notes;

    const [updated] = await db
      .update(savingsGoals)
      .set(updateData)
      .where(eq(savingsGoals.id, id))
      .returning();

    revalidatePath('/finance');
    return {
      success: true,
      goal: {
        ...updated,
        targetAmount: parseFloat(updated.targetAmount),
        currentAmount: parseFloat(updated.currentAmount),
        progress: (parseFloat(updated.currentAmount) / parseFloat(updated.targetAmount)) * 100
      }
    };
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return { error: 'Failed to update savings goal' };
  }
}

export async function deleteSavingsGoal(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const existing = await db.query.savingsGoals.findFirst({
      where: and(
        eq(savingsGoals.id, id),
        eq(savingsGoals.userId, session.user.id)
      )
    });

    if (!existing) {
      return { error: 'Goal not found' };
    }

    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return { error: 'Failed to delete savings goal' };
  }
}

// ============================================================================
// Finance Summary
// ============================================================================

export async function getFinanceSummary() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const [accounts, goals] = await Promise.all([
      db.query.cashAccounts.findMany({
        where: and(
          eq(cashAccounts.userId, session.user.id),
          eq(cashAccounts.isActive, true)
        )
      }),
      db.query.savingsGoals.findMany({
        where: and(
          eq(savingsGoals.userId, session.user.id),
          eq(savingsGoals.isActive, true)
        )
      })
    ]);

    const totalCash = accounts.reduce((sum, acc) => sum + parseFloat(acc.currentBalance), 0);
    const totalSavingsGoal = goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0);
    const totalSavingsCurrent = goals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount), 0);
    const savingsProgress = totalSavingsGoal > 0 ? (totalSavingsCurrent / totalSavingsGoal) * 100 : 0;

    return {
      success: true,
      summary: {
        totalCash,
        totalAccounts: accounts.length,
        totalSavingsGoal,
        totalSavingsCurrent,
        savingsProgress,
        activeGoals: goals.length
      }
    };
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    return { error: 'Failed to fetch finance summary' };
  }
}
