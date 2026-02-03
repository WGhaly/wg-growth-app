'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { SwipeActions } from '@/components/ui/SwipeActions'
import { updateGoalStatus, deleteGoal } from '@/actions/goals'
import { 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Play, 
  XCircle,
  Trash2
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
  const [isLoading, setIsLoading] = useState(false)

  const statusInfo = statusConfig[goal.status]
  const StatusIcon = statusInfo.icon

  const handleStatusChange = async (newStatus: typeof goal.status) => {
    setIsLoading(true)
    const result = await updateGoalStatus(goal.id, newStatus)
    setIsLoading(false)
    
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

  // Define swipe actions based on goal status
  const getSwipeActions = () => {
    const actions = {
      left: [] as any[],
      right: [] as any[],
    };

    // Left swipe actions (status changes)
    if (goal.status !== 'completed') {
      actions.left.push({
        icon: <CheckCircle2 size={20} />,
        label: 'Complete',
        color: 'green' as const,
        onClick: () => handleStatusChange('completed'),
      });
    }

    if (goal.status !== 'in_progress' && goal.status !== 'completed') {
      actions.left.push({
        icon: <Play size={20} />,
        label: 'Start',
        color: 'blue' as const,
        onClick: () => handleStatusChange('in_progress'),
      });
    }

    // Right swipe action (delete)
    actions.right.push({
      icon: <Trash2 size={20} />,
      label: 'Delete',
      color: 'red' as const,
      onClick: handleDelete,
    });

    return actions;
  };

  const swipeActions = getSwipeActions();

  return (
    <SwipeActions
      leftActions={swipeActions.left}
      rightActions={swipeActions.right}
      className="rounded-lg overflow-hidden"
    >
      <Card className="p-4 hover:border-[#ccab52]/30 transition-colors relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#ccab52]" />
            <span className="text-xs font-medium text-[#ccab52] uppercase">
              {goal.category}
            </span>
          </div>
          
          {/* Quick Status Actions - Visible on Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {goal.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isLoading}
                className="p-2 hover:bg-green-500/10 rounded text-green-400 transition-colors disabled:opacity-50"
                title="Mark as completed"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
            {goal.status !== 'in_progress' && goal.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={isLoading}
                className="p-2 hover:bg-blue-500/10 rounded text-blue-400 transition-colors disabled:opacity-50"
                title="Mark as in progress"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 hover:bg-red-500/10 rounded text-red-400 transition-colors disabled:opacity-50"
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
    </SwipeActions>
  )
}
