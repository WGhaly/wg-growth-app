'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoreVertical, Trash2, RefreshCw, DollarSign } from 'lucide-react';
import { deleteAccount, updateAccountBalance } from '@/actions/finance';
import { formatDistanceToNow } from 'date-fns';

interface Account {
  id: string;
  accountName: string;
  accountType: string;
  balance: string;
  currency: string;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountCardProps {
  account: Account;
}

const accountTypeColors: Record<string, string> = {
  checking: 'bg-blue-500/20 text-blue-400',
  savings: 'bg-green-500/20 text-green-400',
  investment: 'bg-purple-500/20 text-purple-400',
  'credit card': 'bg-red-500/20 text-red-400',
  loan: 'bg-orange-500/20 text-orange-400',
};

export function AccountCard({ account }: AccountCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteAccount(account.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // In a real app, this would fetch from a financial API
    // For now, just update the lastSyncedAt timestamp
    await updateAccountBalance(account.id, account.balance);
    setIsSyncing(false);
    setShowMenu(false);
  };

  const balanceNum = parseFloat(account.balance);
  const isNegative = balanceNum < 0;
  const typeColor = accountTypeColors[account.accountType.toLowerCase()] || 'bg-bg-secondary0/20 text-text-tertiary';

  return (
    <>
      <Card className="hover:border-accent-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{account.accountName}</CardTitle>
              <span className={`px-2 py-1 rounded text-xs font-medium ${typeColor}`}>
                {account.accountType}
              </span>
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
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-bg-primary flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing...' : 'Sync Balance'}
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

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-text-tertiary" />
              <p className={`text-2xl font-bold ${isNegative ? 'text-red-500' : 'text-text-primary'}`}>
                {account.currency} {Math.abs(balanceNum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {account.lastSyncedAt && (
              <p className="text-xs text-text-tertiary">
                Last synced {formatDistanceToNow(new Date(account.lastSyncedAt), { addSuffix: true })}
              </p>
            )}

            {!account.lastSyncedAt && (
              <p className="text-xs text-text-tertiary italic">
                Never synced
              </p>
            )}
          </div>
        </CardHeader>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Delete {account.accountName}?</h3>
            <p className="text-text-secondary mb-6">
              This will permanently delete this account. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
