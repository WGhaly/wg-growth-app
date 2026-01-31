'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { updateGoalStatus, deleteGoal } from '@/actions/goals'
import { 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Play, 
  XCircle,
  Trash2,
  MoreVertical 
} from 'lucide-react'
import { format } from 'date-fns'

interface GoalCardProps {
  goal: {
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
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    icon: Circle,
    color: 'text-text-tertiary',
    bgColor: 'bg-bg-secondary0/10',
  },
  in_progress: {
    label: 'In Progress',
    icon: Play,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  abandoned: {
    label: 'Abandoned',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
}

const timeHorizonLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const statusInfo = statusConfig[goal.status]
  const StatusIcon = statusInfo.icon

  const handleStatusChange = async (newStatus: typeof goal.status) => {
    setIsLoading(true)
    const result = await updateGoalStatus(goal.id, newStatus)
    setIsLoading(false)
    setIsMenuOpen(false)
    
    if (!result.error) {
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    setIsLoading(true)
    const result = await deleteGoal(goal.id)
    setIsLoading(false)
    
    if (!result.error) {
      router.refresh()
    }
  }

  return (
    <Card className="p-4 hover:border-[#ccab52]/30 transition-colors relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#ccab52]" />
          <span className="text-xs font-medium text-[#ccab52] uppercase">
            {goal.category}
          </span>
        </div>
        
        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-white/5 rounded transition-colors"
            disabled={isLoading}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => handleStatusChange('not_started')}
                  disabled={goal.status === 'not_started'}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Not Started
                </button>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={goal.status === 'in_progress'}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={goal.status === 'completed'}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => handleStatusChange('abandoned')}
                  disabled={goal.status === 'abandoned'}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Abandoned
                </button>
                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Goal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2">{goal.title}</h3>

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-text-tertiary mb-4 line-clamp-2">{goal.description}</p>
      )}

      {/* Meta Info */}
      <div className="space-y-2">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-2 py-1 rounded ${statusInfo.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className={`text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Time Horizon & Target Date */}
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeHorizonLabels[goal.timeHorizon]}</span>
          </div>
          
          {goal.targetDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Due {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Completed At */}
        {goal.completedAt && (
          <div className="text-xs text-green-400">
            Completed {format(new Date(goal.completedAt), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </Card>
  )
}
