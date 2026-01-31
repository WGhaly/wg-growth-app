'use client'

import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface CustomSelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function CustomSelect({ value, onValueChange, children }: CustomSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within CustomSelect')

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        'w-full px-4 py-2.5 bg-bg-secondary text-text-primary border border-border-default rounded-lg',
        'flex items-center justify-between',
        'hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent-primary',
        'transition-all duration-200',
        className
      )}
    >
      {children}
      <ChevronDown className={cn('w-4 h-4 transition-transform', context.open && 'rotate-180')} />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within CustomSelect')

  // Find the selected item's label - we'll need to pass it through context or find it
  return <span>{context.value || placeholder}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectContent must be used within CustomSelect')

  if (!context.open) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => context.setOpen(false)}
      />
      
      {/* Dropdown */}
      <div className="absolute z-50 w-full mt-2 bg-bg-secondary border border-border-default rounded-lg shadow-lg max-h-60 overflow-y-auto">
        {children}
      </div>
    </>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error('SelectItem must be used within CustomSelect')

  const isSelected = context.value === value

  return (
    <button
      type="button"
      onClick={() => {
        context.onValueChange(value)
        context.setOpen(false)
      }}
      className={cn(
        'w-full px-4 py-2 text-left hover:bg-bg-tertiary transition-colors',
        isSelected && 'bg-accent-primary/10 text-accent-primary font-medium'
      )}
    >
      {children}
    </button>
  )
}
