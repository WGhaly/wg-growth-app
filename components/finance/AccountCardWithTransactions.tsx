'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoreVertical, Trash2, Plus, Receipt } from 'lucide-react';
import { deleteAccount } from '@/actions/finance';
import { getTransactionsByAccount } from '@/actions/transactions';
import { TransactionList } from './TransactionList';
import { AddTransactionModal } from './AddTransactionModal';

interface Account {
  id: string;
  accountName: string;
  accountType: string;
  balance: string;
  currency: string;
  interestRate?: string;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountCardWithTransactionsProps {
  account: Account;
  onUpdate: () => void;
}

const accountTypeColors: Record<string, string> = {
  checking: 'bg-blue-500/20 text-blue-400',
  savings: 'bg-green-500/20 text-green-400',
  investment: 'bg-purple-500/20 text-purple-400',
  credit_card: 'bg-red-500/20 text-red-400',
  debt: 'bg-orange-500/20 text-orange-400',
  loan: 'bg-teal-500/20 text-teal-400',
  cash: 'bg-gray-500/20 text-gray-400',
  other: 'bg-gray-500/20 text-gray-400',
};

export function AccountCardWithTransactions({ account, onUpdate }: AccountCardWithTransactionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const result = await getTransactionsByAccount(account.id);
      if (result.success && result.data) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (showTransactions) {
      loadTransactions();
    }
  }, [showTransactions]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${account.accountName}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    await deleteAccount(account.id);
    onUpdate();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleTransactionSuccess = () => {
    loadTransactions();
    onUpdate();
  };

  const balanceNum = parseFloat(account.balance);
  const isNegative = balanceNum < 0;
  const typeColor = accountTypeColors[account.accountType.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
  const hasInterest = account.interestRate && parseFloat(account.interestRate) > 0;

  return (
    <>
      <Card className="hover:border-accent-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{account.accountName}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${typeColor}`}>
                  {account.accountType.replace('_', ' ').toUpperCase()}
                </span>
                {hasInterest && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    {parseFloat(account.interestRate!).toFixed(2)}% APR
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-bg-primary rounded"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-bg-secondary border border-border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowTransactions(!showTransactions);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary flex items-center gap-2"
                  >
                    <Receipt size={16} />
                    {showTransactions ? 'Hide' : 'Show'} Transactions
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary text-red-500 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-text-tertiary mb-1">Balance</p>
            <p className={`text-2xl font-bold ${isNegative ? 'text-red-500' : 'text-text-primary'}`}>
              EGP {Math.abs(balanceNum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => setShowAddTransaction(true)}
              className="w-full"
              variant="secondary"
            >
              <Plus size={16} className="mr-2" />
              Log Transaction
            </Button>
          </div>
        </CardHeader>

        {showTransactions && (
          <CardContent className="border-t border-border-default pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Recent Transactions</h4>
              <span className="text-xs text-text-tertiary">
                {transactions.length} total
              </span>
            </div>
            {loadingTransactions ? (
              <div className="text-center py-4 text-text-tertiary">Loading...</div>
            ) : (
              <TransactionList transactions={transactions} onUpdate={handleTransactionSuccess} />
            )}
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary mb-6">
                Are you sure you want to delete "{account.accountName}"? This action cannot be undone and all associated transactions will be deleted.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="secondary"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSuccess={handleTransactionSuccess}
        accountId={account.id}
        accountName={account.accountName}
      />
    </>
  );
}
