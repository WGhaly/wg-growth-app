'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { createTransaction } from '@/actions/transactions';
import { X } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: string;
  accountName: string;
}

export function AddTransactionModal({ isOpen, onClose, onSuccess, accountId, accountName }: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    transactionType: 'credit' as 'credit' | 'debit',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createTransaction({
        accountId,
        amount: formData.amount,
        transactionType: formData.transactionType,
        description: formData.description || undefined,
        transactionDate: new Date(formData.transactionDate)
      });

      if (result.error) {
        alert(result.error);
      } else {
        alert('Transaction logged successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          amount: '',
          transactionType: 'credit',
          description: '',
          transactionDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error logging transaction:', error);
      alert('Failed to log transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-4 p-4 border-b border-border-default">
          <h2 className="text-xl font-semibold text-text-primary">
            Log Transaction - {accountName}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-1">
              Amount (EGP) *
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label htmlFor="transactionType" className="block text-sm font-medium text-text-secondary mb-1">
              Transaction Type *
            </label>
            <select
              id="transactionType"
              value={formData.transactionType}
              onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as 'credit' | 'debit' })}
              className="w-full px-3 py-2 border border-border-default rounded-md bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="credit">Credit (+) - Money In</option>
              <option value="debit">Debit (-) - Money Out</option>
            </select>
          </div>

          <div>
            <label htmlFor="transactionDate" className="block text-sm font-medium text-text-secondary mb-1">
              Date *
            </label>
            <Input
              id="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Logging...' : 'Log Transaction'}
            </Button>
            <Button type="button" onClick={onClose} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
