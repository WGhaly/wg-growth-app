'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CreateRoutineModal } from '@/components/routines/CreateRoutineModal'
import { RoutineCard } from '@/components/routines/RoutineCard'
import { Clock, Plus } from 'lucide-react'

interface Routine {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly'
  targetTime: string | null
  minimumDuration: number | null
  idealDuration: number | null
  items: Array<{
    id: string
    itemText: string
    rank: number
  }>
}

interface RoutinesClientProps {
  initialRoutines: Routine[]
}

export function RoutinesClient({ initialRoutines }: RoutinesClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all')

  // Filter routines by type
  const filteredRoutines = selectedType === 'all'
    ? initialRoutines
    : initialRoutines.filter(r => r.type === selectedType)

  // Count by type
  const counts = {
    all: initialRoutines.length,
    daily: initialRoutines.filter(r => r.type === 'daily').length,
    weekly: initialRoutines.filter(r => r.type === 'weekly').length,
    monthly: initialRoutines.filter(r => r.type === 'monthly').length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Routines</h1>
          <p className="text-text-tertiary">Build and track your daily, weekly, and monthly routines</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Routine
        </Button>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', name: 'All Routines' },
          { id: 'daily', name: 'Daily' },
          { id: 'weekly', name: 'Weekly' },
          { id: 'monthly', name: 'Monthly' },
        ].map((type) => {
          const isActive = selectedType === type.id
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#ccab52]/10 border-[#ccab52] text-[#ccab52]'
                  : 'bg-white/5 border-white/10 text-text-tertiary hover:bg-white/10'
              }`}
            >
              <span className="text-sm font-medium">{type.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive ? 'bg-[#ccab52]/20' : 'bg-white/10'
              }`}>
                {counts[type.id as keyof typeof counts]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Routines Grid */}
      {filteredRoutines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
            <h3 className="text-xl font-semibold mb-2">No routines found</h3>
            <p className="text-text-tertiary mb-6">
              {initialRoutines.length === 0
                ? "Start by creating your first routine"
                : "No routines match your filter"}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Routine
            </Button>
          </div>
        </Card>
      )}

      {/* Create Routine Modal */}
      <CreateRoutineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultType={selectedType !== 'all' ? selectedType : undefined}
      />
    </div>
  )
}
