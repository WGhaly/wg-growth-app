'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { savingsGoalSchema, type SavingsGoalInput, type UpdateSavingsGoalInput } from '@/lib/validators';
import { createSavingsGoal, updateSavingsGoal } from '@/actions/finance';
import { X } from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editGoal?: {
    id: string;
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string | null;
    isActive: boolean | null;
    notes?: string | null;
  };
}

export function SavingsGoalModal({ isOpen, onClose, onSuccess, editGoal }: SavingsGoalModalProps) {
  const [formData, setFormData] = useState<SavingsGoalInput>({
    goalName: editGoal?.goalName || '',
    targetAmount: editGoal?.targetAmount || 0,
    currentAmount: editGoal?.currentAmount || 0,
    targetDate: editGoal?.targetDate || '',
    isActive: editGoal?.isActive ?? true,
    notes: editGoal?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validated = savingsGoalSchema.parse(formData);
      
      let result;
      if (editGoal) {
        result = await updateSavingsGoal(editGoal.id, validated as UpdateSavingsGoalInput);
      } else {
        result = await createSavingsGoal(validated);
      }

      if (result.error) {
        alert(result.error);
      } else {
        alert(editGoal ? 'Goal updated successfully!' : 'Goal created successfully!');
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

  const progress = formData.targetAmount > 0 && formData.currentAmount
    ? (formData.currentAmount / formData.targetAmount) * 100 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-bg-secondary p-4 border-b border-border-default">
          <h2 className="text-xl font-semibold text-text-primary">
            {editGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
          </h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label htmlFor="goalName" className="block text-sm font-medium text-text-secondary mb-1">
              Goal Name *
            </label>
            <Input
              id="goalName"
              value={formData.goalName}
              onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
              placeholder="e.g., Emergency Fund"
              required
            />
            {errors.goalName && (
              <p className="text-red-600 text-sm mt-1">{errors.goalName}</p>
            )}
          </div>

          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-text-secondary mb-1">
              Target Amount * ($)
            </label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
              placeholder="10000.00"
              required
            />
            {errors.targetAmount && (
              <p className="text-red-600 text-sm mt-1">{errors.targetAmount}</p>
            )}
          </div>

          <div>
            <label htmlFor="currentAmount" className="block text-sm font-medium text-text-secondary mb-1">
              Current Amount ($)
            </label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            {errors.currentAmount && (
              <p className="text-red-600 text-sm mt-1">{errors.currentAmount}</p>
            )}
          </div>

          {/* Progress Bar */}
          {formData.targetAmount > 0 && (
            <div>
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Progress</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-text-secondary mb-1">
              Target Date
            </label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />
            {errors.targetDate && (
              <p className="text-red-600 text-sm mt-1">{errors.targetDate}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border-default rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-text-secondary">
              Active Goal
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
              placeholder="Optional notes about this savings goal..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : editGoal ? 'Update Goal' : 'Create Goal'}
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
