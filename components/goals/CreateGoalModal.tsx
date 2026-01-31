'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { CustomSelect as Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect'
import { createGoal } from '@/actions/goals'
import { Target, X } from 'lucide-react'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  defaultCategory?: 'faith' | 'character' | 'health' | 'finance' | 'business' | 'relationships'
}

export function CreateGoalModal({ isOpen, onClose, defaultCategory }: CreateGoalModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    category: defaultCategory || 'faith',
    timeHorizon: '1-year' as const,
    title: '',
    description: '',
    whyItMatters: '',
    successCriteria: '',
    targetDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await createGoal(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Reset form and close
    setFormData({
      category: defaultCategory || 'faith',
      timeHorizon: '1-year' as const,
      title: '',
      description: '',
      whyItMatters: '',
      successCriteria: '',
      targetDate: '',
    })
    setIsLoading(false)
    onClose()
    router.refresh()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-2xl bg-[#1a1a1a] rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ccab52]/10 rounded-lg">
              <Target className="w-5 h-5 text-[#ccab52]" />
            </div>
            <h2 className="text-2xl font-semibold">Create New Goal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faith">Faith</SelectItem>
                <SelectItem value="character">Character</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Horizon</label>
            <Select
              value={formData.timeHorizon}
              onValueChange={(value) => setFormData({ ...formData, timeHorizon: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="3-month">3 Months</SelectItem>
                <SelectItem value="6-month">6 Months</SelectItem>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="5-year">5 Years</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              type="text"
              placeholder="e.g., Memorize 10 chapters of Quran"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              placeholder="Describe your goal in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Why It Matters */}
          <div>
            <label className="block text-sm font-medium mb-2">Why It Matters *</label>
            <Textarea
              placeholder="Why is this goal important to you? How does it align with your values and life purpose?"
              value={formData.whyItMatters}
              onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
              rows={3}
              required
            />
            <p className="text-xs text-text-tertiary mt-1">
              Reflect deeply on why this goal matters for your growth and calling
            </p>
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-sm font-medium mb-2">Success Criteria *</label>
            <Textarea
              placeholder="How will you know when you've achieved this goal? What are the specific, measurable outcomes?"
              value={formData.successCriteria}
              onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
              rows={3}
              required
            />
            <p className="text-xs text-text-tertiary mt-1">
              Define clear, specific criteria so you can recognize success
            </p>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Date (Optional)</label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />
            <p className="text-xs text-text-tertiary mt-1">
              Set a specific deadline for this goal
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
