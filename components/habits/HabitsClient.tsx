'use client';

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import HabitCard from './HabitCard';
import CreateHabitModal from './CreateHabitModal';

interface HabitsClientProps {
  initialHabits: Array<{
    id: string;
    type: 'good' | 'bad';
    name: string;
    description: string | null;
    measurement: 'binary' | 'count' | 'duration' | 'scale';
    targetValue: number | null;
    createdAt: Date;
  }>;
}

export default function HabitsClient({ initialHabits }: HabitsClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'good' | 'bad'>('all');

  // Filter habits by selected type
  const filteredHabits = selectedType === 'all'
    ? initialHabits
    : initialHabits.filter(habit => habit.type === selectedType);

  // Calculate counts for each type
  const goodCount = initialHabits.filter(h => h.type === 'good').length;
  const badCount = initialHabits.filter(h => h.type === 'bad').length;

  const getTypeLabel = (type: 'all' | 'good' | 'bad') => {
    switch (type) {
      case 'all': return `All Habits (${initialHabits.length})`;
      case 'good': return `Build (${goodCount})`;
      case 'bad': return `Break (${badCount})`;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Habits</h1>
            <p className="text-text-secondary mt-1">Track and build positive habits, break negative ones</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            New Habit
          </Button>
        </div>

        {/* Type Filter Tabs */}
        <Card className="p-1">
          <div className="flex gap-1">
            {(['all', 'good', 'bad'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-1 px-4 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectedType === type
                    ? 'bg-accent text-white'
                    : 'hover:bg-bg-tertiary'
                }`}
              >
                {type === 'good' && <TrendingUp size={16} />}
                {type === 'bad' && <TrendingDown size={16} />}
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
        </Card>

        {/* Habits Grid */}
        {filteredHabits.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedType === 'good' ? (
                  <TrendingUp className="w-8 h-8 text-text-tertiary" />
                ) : selectedType === 'bad' ? (
                  <TrendingDown className="w-8 h-8 text-text-tertiary" />
                ) : (
                  <Plus className="w-8 h-8 text-text-tertiary" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedType === 'all' && 'No habits yet'}
                {selectedType === 'good' && 'No good habits yet'}
                {selectedType === 'bad' && 'No bad habits yet'}
              </h3>
              <p className="text-text-secondary mb-6">
                {selectedType === 'all' && 'Start tracking habits to build positive behaviors and break negative ones'}
                {selectedType === 'good' && 'Add habits you want to build and maintain consistently'}
                {selectedType === 'bad' && 'Add habits you want to break or eliminate'}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Create Your First Habit
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultType={selectedType === 'all' ? 'good' : selectedType}
      />
    </div>
  );
}
