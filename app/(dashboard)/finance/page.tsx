'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CashAccountModal } from '@/components/finance/CashAccountModal';
import { SavingsGoalModal } from '@/components/finance/SavingsGoalModal';
import { PageContainer } from '@/components/ui/Navigation';
import {
  getCashAccounts,
  getSavingsGoals,
  deleteCashAccount,
  deleteSavingsGoal,
  getFinanceSummary
} from '@/actions/finance';
import { PlusCircle, Edit, Trash2, DollarSign, Target, TrendingUp, Wallet } from 'lucide-react';

interface CashAccount {
  id: string;
  accountName: string;
  accountType: string;
  currentBalance: number;
  isActive: boolean | null;
  notes?: string | null;
}

interface SavingsGoal {
  id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  isActive: boolean | null;
  notes?: string | null;
  progress: number;
}

interface FinanceSummary {
  totalCash: number;
  totalAccounts: number;
  totalSavingsGoal: number;
  totalSavingsCurrent: number;
  savingsProgress: number;
  activeGoals: number;
}

export default function FinancePage() {
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashAccount | undefined>();
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [accountsResult, goalsResult, summaryResult] = await Promise.all([
      getCashAccounts(),
      getSavingsGoals(),
      getFinanceSummary()
    ]);

    if (accountsResult.success && accountsResult.accounts) {
      setCashAccounts(accountsResult.accounts);
    }
    if (goalsResult.success && goalsResult.goals) {
      setSavingsGoals(goalsResult.goals);
    }
    if (summaryResult.success && summaryResult.summary) {
      setSummary(summaryResult.summary);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteAccount = async (id: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"?`)) return;

    const result = await deleteCashAccount(id);
    if (result.error) {
      alert(result.error);
    } else {
      alert('Account deleted successfully!');
      loadData();
    }
  };

  const handleDeleteGoal = async (id: string, goalName: string) => {
    if (!confirm(`Are you sure you want to delete "${goalName}"?`)) return;

    const result = await deleteSavingsGoal(id);
    if (result.error) {
      alert(result.error);
    } else {
      alert('Goal deleted successfully!');
      loadData();
    }
  };

  const handleEditAccount = (account: CashAccount) => {
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleCloseAccountModal = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(undefined);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(undefined);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-text-tertiary">Loading finance data...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Finance Management</h1>
        <p className="text-text-secondary">Manage your cash accounts and savings goals</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Total Cash</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(summary.totalCash)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Active Accounts</p>
                <p className="text-2xl font-bold text-text-primary">{summary.totalAccounts}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Wallet className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Savings Progress</p>
                <p className="text-2xl font-bold text-text-primary">{summary.savingsProgress.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">Active Goals</p>
                <p className="text-2xl font-bold text-text-primary">{summary.activeGoals}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Target className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Cash Accounts Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Cash Accounts</h2>
          <Button onClick={() => setIsAccountModalOpen(true)}>
            <PlusCircle size={20} className="mr-2" />
            Add Account
          </Button>
        </div>

        {cashAccounts.length === 0 ? (
          <Card className="p-8 text-center">
            <Wallet className="mx-auto mb-4 text-text-tertiary" size={48} />
            <p className="text-text-secondary mb-4">No cash accounts yet</p>
            <Button onClick={() => setIsAccountModalOpen(true)}>Create Your First Account</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cashAccounts.map((account) => (
              <Card key={account.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-text-primary">{account.accountName}</h3>
                    <p className="text-sm text-text-tertiary capitalize">
                      {account.accountType.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id, account.accountName)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-text-primary">{formatCurrency(account.currentBalance)}</p>
                </div>
                {account.notes && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">{account.notes}</p>
                )}
                <div className="mt-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      account.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-bg-secondary text-gray-800'
                    }`}
                  >
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Savings Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Savings Goals</h2>
          <Button onClick={() => setIsGoalModalOpen(true)}>
            <PlusCircle size={20} className="mr-2" />
            Add Goal
          </Button>
        </div>

        {savingsGoals.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="mx-auto mb-4 text-text-tertiary" size={48} />
            <p className="text-text-secondary mb-4">No savings goals yet</p>
            <Button onClick={() => setIsGoalModalOpen(true)}>Create Your First Goal</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => (
              <Card key={goal.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-text-primary">{goal.goalName}</h3>
                    <p className="text-sm text-text-tertiary">{formatDate(goal.targetDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id, goal.goalName)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-text-secondary mb-1">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-text-secondary mt-1">
                    {goal.progress.toFixed(1)}% Complete
                  </p>
                </div>

                {goal.notes && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">{goal.notes}</p>
                )}
                
                <div className="mt-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      goal.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-bg-secondary text-gray-800'
                    }`}
                  >
                    {goal.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CashAccountModal
        isOpen={isAccountModalOpen}
        onClose={handleCloseAccountModal}
        onSuccess={loadData}
        editAccount={editingAccount}
      />

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={handleCloseGoalModal}
        onSuccess={loadData}
        editGoal={editingGoal}
      />
    </div>
    </PageContainer>
  );
}
