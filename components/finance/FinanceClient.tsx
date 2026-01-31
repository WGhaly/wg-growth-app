'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, DollarSign, TrendingUp, PiggyBank } from 'lucide-react';
import { AccountCardWithTransactions } from './AccountCardWithTransactions';
import { AddAccountModal } from './AddAccountModal';

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

interface Investment {
  id: string;
  type: string;
  name: string;
  symbol: string | null;
  quantity: string | null;
  purchasePrice: string | null;
  currentPrice: string | null;
  purchaseDate: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FinanceClientProps {
  initialAccounts: Account[];
  initialInvestments: Investment[];
}

export function FinanceClient({ initialAccounts, initialInvestments }: FinanceClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleUpdate = () => {
    window.location.reload(); // Simple refresh for now
  };

  // Calculate net worth from accounts
  const netWorth = useMemo(() => {
    return initialAccounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance);
    }, 0);
  }, [initialAccounts]);

  // Calculate total investment value
  const totalInvestmentValue = useMemo(() => {
    return initialInvestments.reduce((sum, investment) => {
      if (investment.currentPrice && investment.quantity) {
        return sum + (parseFloat(investment.currentPrice) * parseFloat(investment.quantity));
      }
      return sum;
    }, 0);
  }, [initialInvestments]);

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finance</h1>
            <p className="text-text-secondary mt-1">Track accounts, investments, and net worth</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} className="mr-2" />
            Add Account
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-accent-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Net Worth</CardTitle>
                <DollarSign size={20} className="text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                Across {initialAccounts.length} {initialAccounts.length === 1 ? 'account' : 'accounts'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Investments</CardTitle>
                <TrendingUp size={20} className="text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                EGP {totalInvestmentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                {initialInvestments.length} {initialInvestments.length === 1 ? 'investment' : 'investments'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Liquid Assets</CardTitle>
                <PiggyBank size={20} className="text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                EGP {netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-text-tertiary mt-1">Cash & equivalents</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Section */}
        {initialAccounts.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Accounts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialAccounts.map((account) => (
                <AccountCardWithTransactions key={account.id} account={account} onUpdate={handleUpdate} />
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
                <p className="text-text-secondary mb-6">
                  Add your first financial account to start tracking your net worth
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus size={18} className="mr-2" />
                  Add Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investments Section */}
        {initialInvestments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Investments</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialInvestments.map((investment) => (
                <Card key={investment.id} className="hover:border-accent-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{investment.name}</CardTitle>
                    {investment.symbol && (
                      <p className="text-sm text-text-tertiary">{investment.symbol}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Type</span>
                        <span className="capitalize">{investment.type}</span>
                      </div>
                      {investment.currentPrice && investment.quantity && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Value</span>
                          <span className="font-semibold">
                            EGP {(parseFloat(investment.currentPrice) * parseFloat(investment.quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddAccountModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
