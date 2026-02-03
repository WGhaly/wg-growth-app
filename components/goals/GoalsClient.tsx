'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { SwipeHint } from '@/components/ui/SwipeHint'
import { MobileFilterSelect } from '@/components/ui/MobileFilterSelect'
import { CreateGoalModal } from '@/components/goals/CreateGoalModal'
import { GoalCard } from '@/components/goals/GoalCard'
import { 
  Target, 
  Heart, 
  User, 
  Activity, 
  DollarSign, 
  Briefcase, 
  Users
} from 'lucide-react'

interface Goal {
  id: string
  category: string
  timeHorizon: string
  title: string
  description: string | null
  targetDate: string | null
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned'
  completedAt: Date | null
  createdAt: Date
}

interface GoalsClientProps {
  initialGoals: Goal[]
}

const categories = [
  { id: 'all', name: 'All Goals', icon: Target, color: 'text-[#ccab52]' },
  { id: 'faith', name: 'Faith', icon: Heart, color: 'text-purple-400' },
  { id: 'character', name: 'Character', icon: User, color: 'text-blue-400' },
  { id: 'health', name: 'Health', icon: Activity, color: 'text-green-400' },
  { id: 'finance', name: 'Finance', icon: DollarSign, color: 'text-yellow-400' },
  { id: 'business', name: 'Business', icon: Briefcase, color: 'text-orange-400' },
  { id: 'relationships', name: 'Relationships', icon: Users, color: 'text-pink-400' },
]

const statusFilters = [
  { id: 'all', name: 'All' },
  { id: 'not_started', name: 'Not Started' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'completed', name: 'Completed' },
  { id: 'abandoned', name: 'Abandoned' },
]

export function GoalsClient({ initialGoals }: GoalsClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Filter goals based on selected category and status
  const filteredGoals = initialGoals.filter(goal => {
    const categoryMatch = selectedCategory === 'all' || goal.category === selectedCategory
    const statusMatch = selectedStatus === 'all' || goal.status === selectedStatus
    return categoryMatch && statusMatch
  })

  // Count goals by category
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat.id === 'all') {
      acc[cat.id] = initialGoals.length
    } else {
      acc[cat.id] = initialGoals.filter(g => g.category === cat.id).length
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Goals</h1>
          <p className="text-text-tertiary">Set and track your life goals across all categories</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="hidden md:flex">
          <Target className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <MobileFilterSelect
          label="Category"
          options={categories.map(cat => ({
            id: cat.id,
            label: cat.name,
            count: categoryCounts[cat.id] || 0,
            icon: <cat.icon className="w-4 h-4" />,
          }))}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <MobileFilterSelect
          label="Status"
          options={statusFilters.map(status => ({
            id: status.id,
            label: status.name,
          }))}
          value={selectedStatus}
          onChange={setSelectedStatus}
          showAsButtons={true}
        />
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
            <h3 className="text-xl font-semibold mb-2">No goals found</h3>
            <p className="text-text-tertiary mb-6">
              {initialGoals.length === 0
                ? "Start by creating your first goal"
                : "No goals match your filters"}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Target className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </Card>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultCategory={selectedCategory !== 'all' ? selectedCategory as any : undefined}
      />

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden">
        <FloatingActionButton
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Target size={24} />}
        />
      </div>

      {/* Swipe Hint for First-Time Users */}
      {filteredGoals.length > 0 && <SwipeHint storageKey="goals-swipe-hint" />}
    </div>
  )
}
