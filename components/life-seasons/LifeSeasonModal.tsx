'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { createLifeSeason, updateLifeSeason } from '@/actions/life-seasons';

interface LifeSeason {
  id: string;
  seasonName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  keyLearnings?: string | null;
  definingMoments?: string | null;
  annualTheme?: string | null;
  isCurrent: boolean;
}

interface LifeSeasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  season?: LifeSeason | null;
  onSuccess?: () => void;
}

export function LifeSeasonModal({ open, onOpenChange, season, onSuccess }: LifeSeasonModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    seasonName: season?.seasonName || '',
    description: season?.description || '',
    startDate: season?.startDate || '',
    endDate: season?.endDate || '',
    keyLearnings: season?.keyLearnings || '',
    definingMoments: season?.definingMoments || '',
    annualTheme: season?.annualTheme || '',
    isCurrent: season?.isCurrent || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = season
        ? await updateLifeSeason(season.id, formData)
        : await createLifeSeason(formData);

      if (result.success) {
        alert(season ? 'Life season updated!' : 'Life season created!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (error) {
      alert('Failed to save life season');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border-default">
        <div className="p-6 border-b border-border-default">
          <h2 className="text-xl font-semibold text-text-primary">{season ? 'Edit Life Season' : 'Create Life Season'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="seasonName" className="block text-sm font-medium">Season Name *</label>
            <Input
              id="seasonName"
              value={formData.seasonName}
              onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
              placeholder="e.g., Age 30 - Building Phase"
              required
            />
            <p className="text-xs text-text-secondary">
              Give this chapter of your life a meaningful name
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium">Start Date *</label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium">End Date (Optional)</label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="annualTheme" className="block text-sm font-medium">Annual Theme (Optional)</label>
            <Input
              id="annualTheme"
              value={formData.annualTheme}
              onChange={(e) => setFormData({ ...formData, annualTheme: e.target.value })}
              placeholder="e.g., Year of Foundation"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">Description (Optional)</label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this season of life is about..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="keyLearnings" className="block text-sm font-medium">Key Learnings (Optional)</label>
            <Textarea
              id="keyLearnings"
              value={formData.keyLearnings}
              onChange={(e) => setFormData({ ...formData, keyLearnings: e.target.value })}
              placeholder="What are you learning in this season? What wisdom is God revealing?"
              rows={4}
            />
            <p className="text-xs text-text-secondary">
              Document the lessons God is teaching you during this time
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="definingMoments" className="block text-sm font-medium">Defining Moments (Optional)</label>
            <Textarea
              id="definingMoments"
              value={formData.definingMoments}
              onChange={(e) => setFormData({ ...formData, definingMoments: e.target.value })}
              placeholder="What pivotal moments have shaped this season?"
              rows={4}
            />
            <p className="text-xs text-text-secondary">
              Record the breakthrough moments and significant events
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="rounded border-border-default"
            />
            <label htmlFor="isCurrent" className="cursor-pointer font-normal">
              Mark as current season
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : season ? 'Update Season' : 'Create Season'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
