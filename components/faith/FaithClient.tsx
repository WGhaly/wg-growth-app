'use client';

import { useState } from 'react';
import { Plus, Heart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PrayerCard from './PrayerCard';
import CreatePrayerModal from './CreatePrayerModal';

interface FaithClientProps {
  initialPrayers: Array<{
    id: string;
    request: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
    status: 'praying' | 'answered' | 'no_longer_relevant';
    createdAt: Date;
    answeredAt: Date | null;
  }>;
  faithCommitment: string | null;
}

export default function FaithClient({ initialPrayers, faithCommitment }: FaithClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'praying' | 'answered' | 'no_longer_relevant'>('praying');

  // Filter prayers by selected status
  const filteredPrayers = selectedStatus === 'all'
    ? initialPrayers
    : initialPrayers.filter(prayer => prayer.status === selectedStatus);

  // Calculate counts for each status
  const prayingCount = initialPrayers.filter(p => p.status === 'praying').length;
  const answeredCount = initialPrayers.filter(p => p.status === 'answered').length;
  const irrelevantCount = initialPrayers.filter(p => p.status === 'no_longer_relevant').length;

  const getStatusLabel = (status: 'all' | 'praying' | 'answered' | 'no_longer_relevant') => {
    switch (status) {
      case 'all': return `All (${initialPrayers.length})`;
      case 'praying': return `Praying (${prayingCount})`;
      case 'answered': return `Answered (${answeredCount})`;
      case 'no_longer_relevant': return `Not Relevant (${irrelevantCount})`;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Faith</h1>
            <p className="text-text-secondary mt-1">Manage your prayer life and faith commitment</p>
          </div>
          <div className="flex gap-3">
            <a href="/identity">
              <Button variant="secondary">
                Edit Commitment
              </Button>
            </a>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add Prayer
            </Button>
          </div>
        </div>

        {/* Faith Commitment Preview */}
        {faithCommitment && (
          <Card className="p-6 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
            <h3 className="text-sm font-semibold text-accent mb-2">Your Faith Commitment</h3>
            <p className="text-sm text-text-secondary line-clamp-3 whitespace-pre-wrap">
              {faithCommitment}
            </p>
            <a href="/identity">
              <Button variant="text" size="sm" className="mt-2">
                View Full Commitment →
              </Button>
            </a>
          </Card>
        )}

        {/* Status Filter Tabs */}
        <Card className="p-1">
          <div className="flex gap-1">
            {(['praying', 'answered', 'all', 'no_longer_relevant'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`flex-1 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectedStatus === status
                    ? 'bg-accent text-white'
                    : 'hover:bg-bg-tertiary'
                }`}
              >
                {status === 'praying' && <Clock size={16} />}
                {status === 'answered' && <CheckCircle size={16} />}
                {status === 'no_longer_relevant' && <XCircle size={16} />}
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </Card>

        {/* Prayer List */}
        {filteredPrayers.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-text-tertiary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedStatus === 'praying' && 'No active prayer requests'}
                {selectedStatus === 'answered' && 'No answered prayers yet'}
                {selectedStatus === 'no_longer_relevant' && 'No irrelevant prayers'}
                {selectedStatus === 'all' && 'No prayer requests yet'}
              </h3>
              <p className="text-text-secondary mb-6">
                {selectedStatus === 'praying' && 'Add your first prayer request to start building your prayer list'}
                {selectedStatus === 'answered' && 'Prayers marked as answered will appear here'}
                {selectedStatus === 'no_longer_relevant' && 'Prayers no longer relevant will appear here'}
                {selectedStatus === 'all' && 'Start building your prayer list by adding your first request'}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Add Prayer Request
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrayers.map((prayer) => (
              <PrayerCard key={prayer.id} item={prayer} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreatePrayerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
