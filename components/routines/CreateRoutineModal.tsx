'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CustomSelect as Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/CustomSelect'
import { createRoutine } from '@/actions/routines'
import { Clock, X, Plus, Trash2 } from 'lucide-react'

interface CreateRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  defaultType?: 'daily' | 'weekly' | 'monthly'
}

export function CreateRoutineModal({ isOpen, onClose, defaultType }: CreateRoutineModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    type: defaultType || 'daily' as const,
    targetTime: '',
    minimumDuration: '',
    idealDuration: '',
    items: [{ itemText: '', rank: 1 }],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate items
    const validItems = formData.items.filter(item => item.itemText.trim() !== '')
    if (validItems.length === 0) {
      setError('Please add at least one routine item')
      setIsLoading(false)
      return
    }

    const result = await createRoutine({
      name: formData.name,
      type: formData.type,
      targetTime: formData.targetTime || undefined,
      minimumDuration: formData.minimumDuration ? parseInt(formData.minimumDuration) : undefined,
      idealDuration: formData.idealDuration ? parseInt(formData.idealDuration) : undefined,
      items: validItems,
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Reset form and close
    setFormData({
      name: '',
      type: defaultType || 'daily',
      targetTime: '',
      minimumDuration: '',
      idealDuration: '',
      items: [{ itemText: '', rank: 1 }],
    })
    setIsLoading(false)
    onClose()
    router.refresh()
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemText: '', rank: formData.items.length + 1 }],
    })
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      // Reindex ranks
      setFormData({
        ...formData,
        items: newItems.map((item, i) => ({ ...item, rank: i + 1 })),
      })
    }
  }

  const updateItem = (index: number, text: string) => {
    const newItems = [...formData.items]
    newItems[index].itemText = text
    setFormData({ ...formData, items: newItems })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-2xl bg-[#1a1a1a] rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ccab52]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#ccab52]" />
            </div>
            <h2 className="text-2xl font-semibold">Create New Routine</h2>
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Routine Name *</label>
            <Input
              type="text"
              placeholder="e.g., Morning Routine"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Time (Optional)</label>
            <Input
              type="time"
              value={formData.targetTime}
              onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
            />
            <p className="text-xs text-text-tertiary mt-1">
              What time do you want to do this routine?
            </p>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Duration (min)</label>
              <Input
                type="number"
                placeholder="15"
                value={formData.minimumDuration}
                onChange={(e) => setFormData({ ...formData, minimumDuration: e.target.value })}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ideal Duration (min)</label>
              <Input
                type="number"
                placeholder="30"
                value={formData.idealDuration}
                onChange={(e) => setFormData({ ...formData, idealDuration: e.target.value })}
                min="1"
              />
            </div>
          </div>

          {/* Routine Items */}
          <div>
            <label className="block text-sm font-medium mb-2">Routine Steps *</label>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-text-tertiary w-6">{index + 1}.</span>
                  <Input
                    type="text"
                    placeholder="e.g., Meditation"
                    value={item.itemText}
                    onChange={(e) => updateItem(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={addItem}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
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
              {isLoading ? 'Creating...' : 'Create Routine'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
