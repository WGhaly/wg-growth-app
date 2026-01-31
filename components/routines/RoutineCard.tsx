'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { logRoutineCompletion, deleteRoutine } from '@/actions/routines'
import { Clock, CheckCircle, MinusCircle, Trash2, MoreVertical, Target } from 'lucide-react'

interface RoutineCardProps {
  routine: {
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
}

const typeColors = {
  daily: 'text-blue-400 bg-blue-500/10',
  weekly: 'text-purple-400 bg-purple-500/10',
  monthly: 'text-orange-400 bg-orange-500/10',
}

export function RoutineCard({ routine }: RoutineCardProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completionLevel, setCompletionLevel] = useState<'none' | 'minimum' | 'ideal'>('ideal')
  const [duration, setDuration] = useState('')

  const handleComplete = async () => {
    setIsLoading(true)
    const result = await logRoutineCompletion(
      routine.id,
      completionLevel,
      duration ? parseInt(duration) : undefined
    )
    setIsLoading(false)
    
    if (!result.error) {
      setShowCompletionModal(false)
      setDuration('')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this routine?')) return
    
    setIsLoading(true)
    const result = await deleteRoutine(routine.id)
    setIsLoading(false)
    
    if (!result.error) {
      router.refresh()
    }
  }

  return (
    <>
      <Card className="p-4 hover:border-[#ccab52]/30 transition-colors relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#ccab52]" />
            <div>
              <h3 className="font-semibold text-lg">{routine.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-2 py-1 rounded ${typeColors[routine.type]}`}>
                  {routine.type.charAt(0).toUpperCase() + routine.type.slice(1)}
                </span>
                {routine.targetTime && (
                  <span className="text-xs text-text-tertiary">
                    @ {routine.targetTime}
                  </span>
                )}
              </div>
            </div>
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
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Routine
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Duration Info */}
        {(routine.minimumDuration || routine.idealDuration) && (
          <div className="flex items-center gap-4 mb-3 text-xs text-text-tertiary">
            {routine.minimumDuration && (
              <div className="flex items-center gap-1">
                <MinusCircle className="w-3 h-3" />
                <span>Min: {routine.minimumDuration}min</span>
              </div>
            )}
            {routine.idealDuration && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>Ideal: {routine.idealDuration}min</span>
              </div>
            )}
          </div>
        )}

        {/* Routine Items */}
        {routine.items.length > 0 && (
          <div className="mb-4 space-y-1">
            {routine.items.slice(0, 3).map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-text-tertiary">
                <span className="text-text-secondary">{index + 1}.</span>
                <span>{item.itemText}</span>
              </div>
            ))}
            {routine.items.length > 3 && (
              <div className="text-xs text-text-secondary">
                +{routine.items.length - 3} more steps
              </div>
            )}
          </div>
        )}

        {/* Complete Button */}
        <Button
          onClick={() => setShowCompletionModal(true)}
          className="w-full"
          disabled={isLoading}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark Complete
        </Button>
      </Card>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md bg-[#1a1a1a] rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Complete Routine</h3>
            
            <div className="space-y-4">
              {/* Completion Level */}
              <div>
                <label className="block text-sm font-medium mb-2">How did it go?</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setCompletionLevel('ideal')}
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      completionLevel === 'ideal'
                        ? 'bg-green-500/20 border border-green-500 text-green-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">Ideal</div>
                    <div className="text-xs text-text-tertiary">Completed everything at ideal level</div>
                  </button>
                  <button
                    onClick={() => setCompletionLevel('minimum')}
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      completionLevel === 'minimum'
                        ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">Minimum</div>
                    <div className="text-xs text-text-tertiary">Did the minimum required</div>
                  </button>
                  <button
                    onClick={() => setCompletionLevel('none')}
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      completionLevel === 'none'
                        ? 'bg-red-500/20 border border-red-500 text-red-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">Skipped</div>
                    <div className="text-xs text-text-tertiary">Didn't complete the routine</div>
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2 bg-bg-secondary border border-border-default rounded-lg"
                  min="1"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCompletionModal(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Logging...' : 'Log Completion'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
