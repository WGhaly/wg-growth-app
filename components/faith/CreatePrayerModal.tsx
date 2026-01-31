'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createPrayerItem } from '@/actions/prayer';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { CustomSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect';

interface CreatePrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as_needed', label: 'As Needed' },
];

export default function CreatePrayerModal({ isOpen, onClose }: CreatePrayerModalProps) {
  const [formData, setFormData] = useState({
    request: '',
    frequency: 'daily',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.request.trim()) {
      setError('Please enter a prayer request');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPrayerItem({
        request: formData.request.trim(),
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly' | 'as_needed',
      });

      if (result.success) {
        setFormData({
          request: '',
          frequency: 'daily',
        });
        onClose();
      } else {
        setError(result.error || 'Failed to create prayer item');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-default rounded-lg p-6 w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add Prayer Request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prayer Request */}
          <div>
            <label htmlFor="request" className="block text-sm font-medium mb-2">
              Prayer Request *
            </label>
            <Textarea
              id="request"
              placeholder="e.g., Healing for Mom, Wisdom for decision, Peace in difficult situation...&#10;&#10;Add any details or context here."
              value={formData.request}
              onChange={(e) => setFormData({ ...formData, request: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium mb-2">Prayer Frequency</label>
            <CustomSelect
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </CustomSelect>
            <p className="text-xs text-text-tertiary mt-1">
              How often you want to be reminded to pray for this
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                'Adding...'
              ) : (
                <>
                  <Plus size={18} className="mr-2" />
                  Add Prayer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
