'use client';

import { useState } from 'react';
import { Trash2, Target, TrendingUp, TrendingDown, Plus, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SwipeActions } from '@/components/ui/SwipeActions';
import { deleteHabit, logHabit } from '@/actions/habits';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface HabitCardProps {
  habit: {
    id: string;
    type: 'good' | 'bad';
    name: string;
    description: string | null;
    measurement: 'binary' | 'count' | 'duration' | 'scale';
    targetValue: number | null;
    createdAt: Date;
    currentStreak?: number;
    hasLoggedToday?: boolean;
  };
}

export default function HabitCard({ habit }: HabitCardProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Log modal state
  const [logValue, setLogValue] = useState(
    habit.measurement === 'binary' ? '1' :
    habit.measurement === 'count' ? '' :
    habit.measurement === 'duration' ? '' :
    ''
  );
  const [logNotes, setLogNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteHabit(habit.id);
    if (!result.success) {
      alert(result.error || 'Failed to delete habit');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);

    try {
      const result = await logHabit(
        habit.id,
        parseFloat(logValue),
        logNotes.trim() || undefined
      );

      if (result.success) {
        setShowLogModal(false);
        setLogValue(habit.measurement === 'binary' ? '1' : '');
        setLogNotes('');
      } else {
        alert(result.error || 'Failed to log habit');
      }
    } catch (err) {
      alert('An unexpected error occurred');
    } finally {
      setIsLogging(false);
    }
  };

  const getTypeStyles = () => {
    if (habit.type === 'good') {
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const getMeasurementLabel = () => {
    switch (habit.measurement) {
      case 'binary': return 'Yes/No';
      case 'count': return 'Count';
      case 'duration': return 'Minutes';
      case 'scale': return 'Scale 1-10';
    }
  };

  return (
    <>
      <SwipeActions
        leftActions={[
          {
            icon: <Plus size={20} />,
            label: 'Log',
            color: 'green' as const,
            onClick: () => setShowLogModal(true),
          },
        ]}
        rightActions={[
          {
            icon: <Trash2 size={20} />,
            label: 'Delete',
            color: 'red' as const,
            onClick: () => setShowDeleteConfirm(true),
          },
        ]}
        className="rounded-lg overflow-hidden"
      >
        <Card className="relative group hover:border-accent transition-colors">
          <CardHeader>
            {/* Header with Type Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeStyles()}`}>
                    {habit.type === 'good' ? (
                      <>
                        <TrendingUp size={12} className="inline mr-1" />
                        Build
                      </>
                    ) : (
                      <>
                        <TrendingDown size={12} className="inline mr-1" />
                        Break
                      </>
                    )}
                  </div>
                  {habit.hasLoggedToday && (
                    <div className="px-2 py-1 rounded text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                      <CheckCircle size={12} className="inline mr-1" />
                      Logged Today
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{habit.name}</h3>
                {habit.description && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* Desktop Actions - Hidden on Mobile */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setShowLogModal(true)}
                  className="p-2 hover:bg-green-500/10 rounded text-green-400 transition-colors"
                  title="Log habit"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-red-500/10 rounded text-red-400 transition-colors"
                  title="Delete habit"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xs text-text-tertiary mb-1">Type</div>
              <div className="text-sm font-medium">{getMeasurementLabel()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-tertiary mb-1">Target</div>
              <div className="text-sm font-medium flex items-center justify-center gap-1">
                <Target size={14} />
                {habit.targetValue || 0}
                {habit.measurement === 'duration' && 'min'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-tertiary mb-1">Streak</div>
              <div className="text-sm font-medium text-accent">
                {habit.currentStreak || 0} days
              </div>
            </div>
          </div>

          {/* Log Button */}
          <Button
            onClick={() => setShowLogModal(true)}
            variant="secondary"
            className="w-full"
            disabled={habit.hasLoggedToday}
          >
            <Plus size={18} className="mr-2" />
            {habit.hasLoggedToday ? 'Already Logged Today' : 'Log Today'}
          </Button>
        </CardContent>
      </Card>
      </SwipeActions>

      {/* Log Habit Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogModal(false)} />
          <div className="relative bg-bg-secondary border border-border-default rounded-lg p-6 w-full max-w-md z-10">
            <h3 className="text-xl font-bold mb-4">Log {habit.name}</h3>
            
            <form onSubmit={handleLogHabit} className="space-y-4">
              {/* Value Input */}
              <div>
                <label htmlFor="value" className="block text-sm font-medium mb-2">
                  {habit.measurement === 'binary' ? 'Did you do it?' :
                   habit.measurement === 'count' ? 'Count' :
                   habit.measurement === 'duration' ? 'Duration (minutes)' :
                   'Scale (1-10)'}
                </label>
                {habit.measurement === 'binary' ? (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={logValue === '1' ? 'primary' : 'secondary'}
                      onClick={() => setLogValue('1')}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={logValue === '0' ? 'primary' : 'secondary'}
                      onClick={() => setLogValue('0')}
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Input
                    id="value"
                    type="number"
                    step={habit.measurement === 'scale' ? '0.1' : '1'}
                    min={habit.measurement === 'scale' ? '1' : '0'}
                    max={habit.measurement === 'scale' ? '10' : undefined}
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about today's entry..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowLogModal(false)}
                  disabled={isLogging}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLogging} className="flex-1">
                  {isLogging ? 'Logging...' : 'Log Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-bg-secondary border border-border-default rounded-lg p-6 w-full max-w-md z-10">
            <h3 className="text-xl font-bold mb-2">Delete Habit?</h3>
            <p className="text-text-secondary mb-6">
              This will permanently delete "{habit.name}" and all its logs. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600"
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
