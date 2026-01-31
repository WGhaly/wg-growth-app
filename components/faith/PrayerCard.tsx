'use client';

import { useState } from 'react';
import { Trash2, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { deletePrayerItem, updatePrayerStatus } from '@/actions/prayer';
import { formatDistanceToNow } from 'date-fns';

interface PrayerCardProps {
  item: {
    id: string;
    request: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
    status: 'praying' | 'answered' | 'no_longer_relevant';
    createdAt: Date;
    answeredAt: Date | null;
  };
}

export default function PrayerCard({ item }: PrayerCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePrayerItem(item.id);
    if (!result.success) {
      alert(result.error || 'Failed to delete prayer item');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusChange = async (status: 'praying' | 'answered' | 'no_longer_relevant') => {
    await updatePrayerStatus(item.id, status);
    setIsMenuOpen(false);
  };

  const getStatusStyles = () => {
    switch (item.status) {
      case 'praying':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'answered':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'no_longer_relevant':
        return 'bg-bg-secondary0/10 text-text-tertiary border-gray-500/20';
    }
  };

  const getFrequencyLabel = () => {
    switch (item.frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'as_needed': return 'As Needed';
    }
  };

  return (
    <>
      <Card className="relative group hover:border-accent transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusStyles()}`}>
                  {item.status === 'praying' && (
                    <>
                      <Clock size={12} className="inline mr-1" />
                      Praying
                    </>
                  )}
                  {item.status === 'answered' && (
                    <>
                      <CheckCircle size={12} className="inline mr-1" />
                      Answered
                    </>
                  )}
                  {item.status === 'no_longer_relevant' && (
                    <>
                      <XCircle size={12} className="inline mr-1" />
                      No Longer Relevant
                    </>
                  )}
                </div>
                <div className="px-2 py-1 rounded text-xs font-medium bg-bg-tertiary text-text-secondary">
                  {getFrequencyLabel()}
                </div>
              </div>
              <h3 className="text-lg font-semibold">{item.request}</h3>
              <p className="text-xs text-text-tertiary mt-2">
                Added {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                {item.answeredAt && (
                  <> • Answered {formatDistanceToNow(new Date(item.answeredAt), { addSuffix: true })}</>
                )}
              </p>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 hover:bg-bg-tertiary rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical size={18} />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-bg-secondary border border-border-default rounded-lg shadow-lg py-1 min-w-[180px]">
                    {item.status !== 'answered' && (
                      <button
                        onClick={() => handleStatusChange('answered')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2 text-green-400"
                      >
                        <CheckCircle size={16} />
                        Mark Answered
                      </button>
                    )}
                    {item.status !== 'praying' && (
                      <button
                        onClick={() => handleStatusChange('praying')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"
                      >
                        <Clock size={16} />
                        Mark Praying
                      </button>
                    )}
                    {item.status !== 'no_longer_relevant' && (
                      <button
                        onClick={() => handleStatusChange('no_longer_relevant')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Not Relevant
                      </button>
                    )}
                    <div className="border-t border-border-default my-1" />
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2 text-red-400"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-bg-secondary border border-border-default rounded-lg p-6 w-full max-w-md z-10">
            <h3 className="text-xl font-bold mb-2">Delete Prayer Item?</h3>
            <p className="text-text-secondary mb-6">
              This will permanently delete "{item.request}". This action cannot be undone.
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
