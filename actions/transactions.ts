'use server';

import { db } from '@/lib/db';
import { transactions, cashAccounts } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface TransactionData {
  accountId: string;
  amount: string;
  transactionType: 'credit' | 'debit';
  description?: string;
  transactionDate?: Date;
}

export async function createTransaction(data: TransactionData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account belongs to user
    const account = await db.query.cashAccounts.findFirst({
      where: and(
        eq(cashAccounts.id, data.accountId),
        eq(cashAccounts.userId, session.user.id)
      )
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Create transaction
    const [transaction] = await db.insert(transactions).values({
      userId: session.user.id,
      accountId: data.accountId,
      amount: data.amount,
      transactionType: data.transactionType,
      description: data.description,
      transactionDate: data.transactionDate || new Date()
    }).returning();

    // Update account balance
    const amountValue = parseFloat(data.amount);
    const balanceChange = data.transactionType === 'credit' ? amountValue : -amountValue;
    
    await db.update(cashAccounts)
      .set({
        currentBalance: sql`${cashAccounts.currentBalance} + ${balanceChange}`,
        updatedAt: new Date()
      })
      .where(eq(cashAccounts.id, data.accountId));

    revalidatePath('/finance');
    return { success: true, data: transaction };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: 'Failed to create transaction' };
  }
}

export async function getTransactionsByAccount(accountId: string, limit = 50) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify account belongs to user
    const account = await db.query.cashAccounts.findFirst({
      where: and(
        eq(cashAccounts.id, accountId),
        eq(cashAccounts.userId, session.user.id)
      )
    });

    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    const accountTransactions = await db.query.transactions.findMany({
      where: eq(transactions.accountId, accountId),
      orderBy: [desc(transactions.transactionDate)],
      limit
    });

    return { success: true, data: accountTransactions };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { success: false, error: 'Failed to fetch transactions' };
  }
}

export async function getAllTransactions(limit = 100) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, session.user.id),
      orderBy: [desc(transactions.transactionDate)],
      limit,
      with: {
        account: {
          columns: {
            accountName: true,
            accountType: true
          }
        }
      }
    });

    return { success: true, data: userTransactions };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { success: false, error: 'Failed to fetch transactions' };
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get transaction to verify ownership and get details for balance reversal
    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, session.user.id)
      )
    });

    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    // Reverse the balance change
    const amountValue = parseFloat(transaction.amount);
    const balanceChange = transaction.transactionType === 'credit' ? -amountValue : amountValue;
    
    await db.update(cashAccounts)
      .set({
        currentBalance: sql`${cashAccounts.currentBalance} + ${balanceChange}`,
        updatedAt: new Date()
      })
      .where(eq(cashAccounts.id, transaction.accountId));

    // Delete transaction
    await db.delete(transactions).where(eq(transactions.id, transactionId));

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: 'Failed to delete transaction' };
  }
}
