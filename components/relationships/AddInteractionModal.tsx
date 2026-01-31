'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CustomSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect';
import { X } from 'lucide-react';
import { createInteraction } from '@/actions/interactions';
import { updateLastContacted } from '@/actions/relationships';

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
}

export function AddInteractionModal({ isOpen, onClose, personId, personName }: AddInteractionModalProps) {
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [emotionalImpact, setEmotionalImpact] = useState<string>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await createInteraction({
        personId,
        interactionDate,
        summary,
        emotionalImpact: emotionalImpact as any,
      });

      if (result.success) {
        // Also update the last contacted timestamp
        await updateLastContacted(personId);
        
        setSummary('');
        setEmotionalImpact('neutral');
        setInteractionDate(new Date().toISOString().split('T')[0]);
        onClose();
      } else {
        setError(result.error || 'Failed to add interaction');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Add Interaction with {personName}</h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={interactionDate}
              onChange={(e) => setInteractionDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Emotional Impact
            </label>
            <CustomSelect
              value={emotionalImpact}
              onValueChange={setEmotionalImpact}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_positive">Very Positive</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="very_negative">Very Negative</SelectItem>
              </SelectContent>
            </CustomSelect>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Summary <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe the interaction... What did you discuss? How did it go?"
              rows={6}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !summary}>
              {isSubmitting ? 'Adding...' : 'Add Interaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
