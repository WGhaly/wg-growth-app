'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { cashAccountSchema, ACCOUNT_TYPES, type CashAccountInput, type UpdateCashAccountInput } from '@/lib/validators';
import { createCashAccount, updateCashAccount } from '@/actions/finance';
import { X } from 'lucide-react';

interface CashAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAccount?: {
    id: string;
    accountName: string;
    accountType: string;
    currentBalance: number;
    isActive: boolean | null;
    notes?: string | null;
  };
}

export function CashAccountModal({ isOpen, onClose, onSuccess, editAccount }: CashAccountModalProps) {
  const [formData, setFormData] = useState<CashAccountInput>({
    accountName: editAccount?.accountName || '',
    accountType: editAccount?.accountType || 'checking',
    currentBalance: editAccount?.currentBalance || 0,
    interestRate: 0,
    isActive: editAccount?.isActive ?? true,
    notes: editAccount?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validated = cashAccountSchema.parse(formData);
      
      let result;
      if (editAccount) {
        result = await updateCashAccount(editAccount.id, validated as UpdateCashAccountInput);
      } else {
        result = await createCashAccount(validated);
      }

      if (result.error) {
        alert(result.error);
      } else {
        alert(editAccount ? 'Account updated successfully!' : 'Account created successfully!');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-bg-secondary p-4 border-b border-border-default">
          <h2 className="text-xl font-semibold text-text-primary">
            {editAccount ? 'Edit Cash Account' : 'Create Cash Account'}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-text-secondary mb-1">
              Account Name *
            </label>
            <Input
              id="accountName"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              placeholder="e.g., Main Checking"
              required
            />
            {errors.accountName && (
              <p className="text-red-600 text-sm mt-1">{errors.accountName}</p>
            )}
          </div>

          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-text-secondary mb-1">
              Account Type *
            </label>
            <select
              id="accountType"
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full px-3 py-2 border border-border-default rounded-md bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.accountType && (
              <p className="text-red-600 text-sm mt-1">{errors.accountType}</p>
            )}
          </div>

          <div>
            <label htmlFor="currentBalance" className="block text-sm font-medium text-text-secondary mb-1">
              Current Balance
            </label>
            <Input
              id="currentBalance"
              type="number"
              step="0.01"
              value={formData.currentBalance}
              onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            {errors.currentBalance && (
              <p className="text-red-600 text-sm mt-1">{errors.currentBalance}</p>
            )}
          </div>

          {(formData.accountType === 'debt' || formData.accountType === 'loan') && (
            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-text-secondary mb-1">
                Interest Rate (%)
              </label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 5.5"
              />
              <p className="text-sm text-text-tertiary mt-1">
                Annual interest rate for this {formData.accountType}
              </p>
              {errors.interestRate && (
                <p className="text-red-600 text-sm mt-1">{errors.interestRate}</p>
              )}
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border-default rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-text-secondary">
              Active Account
            </label>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">
              Notes
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this account..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : editAccount ? 'Update Account' : 'Create Account'}
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
