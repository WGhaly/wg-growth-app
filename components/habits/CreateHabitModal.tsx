'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createHabit } from '@/actions/habits';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CustomSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'good' | 'bad';
}

const measurementTypes = [
  { value: 'binary', label: 'Yes/No (Binary)' },
  { value: 'count', label: 'Count (Number)' },
  { value: 'duration', label: 'Duration (Minutes)' },
  { value: 'scale', label: 'Scale (1-10)' },
];

export default function CreateHabitModal({ isOpen, onClose, defaultType = 'good' }: CreateHabitModalProps) {
  const [formData, setFormData] = useState({
    type: defaultType,
    name: '',
    description: '',
    measurement: 'binary',
    targetValue: '1',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createHabit({
        type: formData.type as 'good' | 'bad',
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        measurement: formData.measurement as 'binary' | 'count' | 'duration' | 'scale',
        targetValue: parseFloat(formData.targetValue),
        startDate: new Date().toISOString().split('T')[0],
      });

      if (result.success) {
        setFormData({
          type: defaultType,
          name: '',
          description: '',
          measurement: 'binary',
          targetValue: '1',
        });
        onClose();
      } else {
        setError(result.error || 'Failed to create habit');
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
        <h2 className="text-2xl font-bold mb-4">Create New Habit</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Select */}
          <div>
            <label className="block text-sm font-medium mb-2">Habit Type</label>
            <CustomSelect
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as 'good' | 'bad' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good Habit (Build)</SelectItem>
                <SelectItem value="bad">Bad Habit (Break)</SelectItem>
              </SelectContent>
            </CustomSelect>
            <p className="text-xs text-text-tertiary mt-1">
              {formData.type === 'good' 
                ? 'Track habits you want to build and maintain'
                : 'Track habits you want to break or eliminate'}
            </p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Habit Name *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Morning Exercise, Meditation, Avoid Social Media"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="Add any details or notes about this habit..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Measurement Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Measurement Type</label>
            <CustomSelect
              value={formData.measurement}
              onValueChange={(value) => {
                // Set default target value based on measurement type
                let defaultTarget = '1';
                if (value === 'binary') defaultTarget = '1';
                else if (value === 'count') defaultTarget = '1';
                else if (value === 'duration') defaultTarget = '30';
                else if (value === 'scale') defaultTarget = '7';
                
                setFormData({ 
                  ...formData, 
                  measurement: value,
                  targetValue: defaultTarget,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select measurement type" />
              </SelectTrigger>
              <SelectContent>
                {measurementTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </CustomSelect>
            <p className="text-xs text-text-tertiary mt-1">
              {formData.measurement === 'binary' && 'Simple yes/no tracking (did it or didn\'t)'}
              {formData.measurement === 'count' && 'Track a specific count or number'}
              {formData.measurement === 'duration' && 'Track time spent in minutes'}
              {formData.measurement === 'scale' && 'Rate on a scale from 1 to 10'}
            </p>
          </div>

          {/* Target Value */}
          <div>
            <label htmlFor="targetValue" className="block text-sm font-medium mb-2">
              Target Value
            </label>
            <Input
              id="targetValue"
              type="number"
              step="0.01"
              placeholder={
                formData.measurement === 'binary' ? '1 (Yes)' :
                formData.measurement === 'count' ? 'e.g., 8 (glasses of water)' :
                formData.measurement === 'duration' ? 'e.g., 30 (minutes)' :
                'e.g., 7 (out of 10)'
              }
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              required
            />
            <p className="text-xs text-text-tertiary mt-1">
              {formData.type === 'good' 
                ? 'The minimum value to meet your daily goal'
                : 'The maximum acceptable value (0 is ideal for bad habits)'}
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
                'Creating...'
              ) : (
                <>
                  <Plus size={18} className="mr-2" />
                  Create Habit
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
