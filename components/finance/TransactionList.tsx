'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteTransaction } from '@/actions/transactions';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  amount: string;
  transactionType: string;
  description: string | null;
  transactionDate: Date;
  createdAt: Date;
}

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

export function TransactionList({ transactions, onUpdate }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction? The account balance will be adjusted accordingly.')) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteTransaction(id);
      if (result.error) {
        alert(result.error);
      } else {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-text-tertiary">
        No transactions yet. Click "Log Transaction" to add one.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-bg-secondary hover:bg-bg-tertiary transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-full ${
              transaction.transactionType === 'credit' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.transactionType === 'credit' ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-text-primary font-medium">
                {transaction.description || 'No description'}
              </p>
              <p className="text-sm text-text-tertiary">
                {formatDate(transaction.transactionDate)}
              </p>
            </div>

            <div className="text-right">
              <p className={`text-lg font-semibold ${
                transaction.transactionType === 'credit' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.transactionType === 'credit' ? '+' : '-'}EGP {formatAmount(transaction.amount)}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => handleDelete(transaction.id)}
            disabled={deletingId === transaction.id}
            className="ml-3"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}
