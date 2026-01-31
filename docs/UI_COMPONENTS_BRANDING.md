# WG Life OS - UI Components & Branding Guide

**Project Owner:** Waseem Ghaly  
**Design System:** Dark Mode Only, Calm & Serious  
**Date:** January 29, 2026

---

## TABLE OF CONTENTS

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Library](#5-component-library)
6. [Icons & Imagery](#6-icons--imagery)
7. [Animation & Transitions](#7-animation--transitions)
8. [Accessibility](#8-accessibility)
9. [Responsive Design](#9-responsive-design)
10. [Tailwind Configuration](#10-tailwind-configuration)

---

## 1. DESIGN PHILOSOPHY

### Core Principles

1. **Calm, Not Chaotic**
   - No bright colors or flashy animations
   - Subtle, purposeful interactions
   - Clean, spacious layouts

2. **Serious, Not Gamified**
   - No badges, achievements, or points
   - No confetti or celebration animations
   - Growth-focused, not entertainment-focused

3. **Functional, Not Decorative**
   - Every element serves a purpose
   - Minimal ornamentation
   - Data-dense when needed

4. **Dark Mode Only**
   - Deep black backgrounds (#0F0F0F)
   - High contrast for readability
   - Gentle on eyes during extended use

### Visual Tone

- **Masculine** (not aggressive)
- **Mature** (not playful)
- **Disciplined** (not rigid)
- **Honest** (not showy)

---

## 2. COLOR SYSTEM

### Primary Palette

```css
/* Background */
--bg-primary: #0F0F0F      /* Main background */
--bg-secondary: #1A1A1A    /* Cards, elevated surfaces */
--bg-tertiary: #2A2A2A     /* Hover states, inputs */

/* Text */
--text-primary: #F5F5F5    /* Main text */
--text-secondary: #B3B3B3  /* Secondary text */
--text-tertiary: #808080   /* Disabled, placeholders */

/* Accent */
--accent-primary: #B08968  /* Brown gold - primary actions */
--accent-hover: #C9A57B    /* Lighter on hover */
--accent-active: #927048   /* Darker on click */

/* Borders */
--border-subtle: #2A2A2A   /* Subtle dividers */
--border-default: #404040  /* Default borders */
--border-strong: #5A5A5A   /* Strong emphasis */
```

### Semantic Colors

```css
/* Success */
--success-bg: #1A2E1A      /* Background */
--success-border: #2D4A2D  /* Border */
--success-text: #7FD17F    /* Text */

/* Warning */
--warning-bg: #2E2A1A      /* Background */
--warning-border: #4A442D  /* Border */
--warning-text: #FFD166    /* Text */

/* Error */
--error-bg: #2E1A1A        /* Background */
--error-border: #4A2D2D    /* Border */
--error-text: #FF6B6B      /* Text */

/* Info */
--info-bg: #1A1F2E         /* Background */
--info-border: #2D3A4A     /* Border */
--info-text: #6BA3FF       /* Text */
```

### Category Colors (Muted)

```css
/* Goal/Habit Categories */
--faith: #7A6F9E           /* Purple, muted */
--character: #9E7A6F       /* Brown, muted */
--health: #6F9E7A          /* Green, muted */
--finance: #9E8F6F         /* Gold, muted */
--business: #7A8F9E        /* Blue, muted */
--relationships: #9E6F8F   /* Mauve, muted */
```

### Usage Rules

1. **Never use pure white** (#FFFFFF) - always use --text-primary (#F5F5F5)
2. **Never use pure black** (#000000) - always use --bg-primary (#0F0F0F)
3. **Accent color sparingly** - only for primary CTAs and key highlights
4. **Category colors** - only for icons and labels, not backgrounds
5. **Semantic colors** - only for alerts, toasts, and status indicators

---

## 3. TYPOGRAPHY

### Font Stack

```css
/* Primary Font: Inter (sans-serif) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace (for data, code) */
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

### Type Scale

```css
/* Headings */
--text-5xl: 48px / 56px   /* font-size / line-height */
--text-4xl: 36px / 44px
--text-3xl: 30px / 38px
--text-2xl: 24px / 32px
--text-xl: 20px / 28px
--text-lg: 18px / 26px

/* Body */
--text-base: 16px / 24px  /* Default body text */
--text-sm: 14px / 20px    /* Small text, captions */
--text-xs: 12px / 16px    /* Tiny text, labels */
```

### Font Weights

```css
--font-light: 300
--font-normal: 400   /* Default */
--font-medium: 500
--font-semibold: 600 /* Headings */
--font-bold: 700     /* Emphasis */
```

### Usage Guidelines

```tsx
// H1 (Page Titles)
<h1 className="text-3xl font-semibold text-primary">
  Dashboard
</h1>

// H2 (Section Titles)
<h2 className="text-2xl font-semibold text-primary">
  Active Goals
</h2>

// H3 (Card Titles)
<h3 className="text-xl font-medium text-primary">
  Morning Routine
</h3>

// Body Text
<p className="text-base text-secondary">
  Your routine completion dropped 35% this week.
</p>

// Small Text (Metadata)
<span className="text-sm text-tertiary">
  Last updated: 2 days ago
</span>

// Labels (Forms)
<label className="text-sm font-medium text-primary">
  Email Address
</label>
```

---

## 4. SPACING & LAYOUT

### Spacing Scale

```css
/* Tailwind spacing */
1 = 4px
2 = 8px
3 = 12px
4 = 16px
6 = 24px
8 = 32px
12 = 48px
16 = 64px
```

### Common Patterns

```tsx
// Container Padding
<div className="px-4 py-6 md:px-6 md:py-8">
  {/* Mobile: 16px/24px, Desktop: 24px/32px */}
</div>

// Card Spacing
<div className="p-6 space-y-4">
  {/* Padding: 24px, Vertical gap: 16px */}
</div>

// Section Spacing
<section className="space-y-6">
  {/* Vertical gap between sections: 24px */}
</section>

// Stack (Vertical)
<div className="flex flex-col space-y-3">
  {/* Gap between items: 12px */}
</div>

// Row (Horizontal)
<div className="flex items-center space-x-3">
  {/* Gap between items: 12px */}
</div>
```

### Breakpoints

```css
/* Tailwind default */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## 5. COMPONENT LIBRARY

### 5.1 Buttons

#### Primary Button

```tsx
// File: components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export function PrimaryButton({ 
  children, 
  onClick, 
  disabled, 
  loading,
  type = 'button',
  className = '' 
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full px-6 py-3 
        bg-accent-primary hover:bg-accent-hover active:bg-accent-active
        text-bg-primary font-medium
        rounded-lg
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          {/* Spinner icon */}
        </svg>
      ) : children}
    </button>
  )
}

// Usage
<PrimaryButton onClick={handleSubmit}>
  Continue →
</PrimaryButton>
```

#### Secondary Button

```tsx
export function SecondaryButton({ children, onClick, disabled, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-6 py-3
        bg-bg-secondary hover:bg-bg-tertiary
        text-text-primary font-medium
        border border-border-default
        rounded-lg
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}
```

#### Text Button

```tsx
export function TextButton({ children, onClick, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        text-accent-primary hover:text-accent-hover
        font-medium
        transition-colors duration-200
        ${className}
      `}
    >
      {children}
    </button>
  )
}
```

---

### 5.2 Form Inputs

#### Text Input

```tsx
// File: components/ui/Input.tsx
interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number'
  error?: string
  disabled?: boolean
  required?: boolean
}

export function Input({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  error,
  disabled,
  required
}: InputProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error-text ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3
          bg-bg-secondary 
          border ${error ? 'border-error-border' : 'border-border-default'}
          rounded-lg
          text-text-primary placeholder:text-text-tertiary
          focus:outline-none focus:ring-2 focus:ring-accent-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      />
      
      {error && (
        <p className="text-sm text-error-text">{error}</p>
      )}
    </div>
  )
}

// Usage
<Input
  label="Email Address"
  placeholder="you@example.com"
  type="email"
  value={email}
  onChange={setEmail}
  error={emailError}
  required
/>
```

#### Textarea

```tsx
export function Textarea({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  rows = 4,
  error 
}: TextareaProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full px-4 py-3
          bg-bg-secondary 
          border ${error ? 'border-error-border' : 'border-border-default'}
          rounded-lg
          text-text-primary placeholder:text-text-tertiary
          focus:outline-none focus:ring-2 focus:ring-accent-primary
          resize-y
          transition-colors duration-200
        `}
      />
      
      {error && (
        <p className="text-sm text-error-text">{error}</p>
      )}
    </div>
  )
}
```

#### Select Dropdown

```tsx
interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

export function Select({ label, value, onChange, options, placeholder }: SelectProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-4 py-3
          bg-bg-secondary 
          border border-border-default
          rounded-lg
          text-text-primary
          focus:outline-none focus:ring-2 focus:ring-accent-primary
          appearance-none cursor-pointer
          transition-colors duration-200
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

### 5.3 Cards

#### Base Card

```tsx
// File: components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-secondary 
        border border-border-subtle
        rounded-lg
        p-6
        ${onClick ? 'cursor-pointer hover:bg-bg-tertiary transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

#### Goal Card

```tsx
export function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card onClick={() => navigate(`/goals/${goal.id}`)}>
      <div className="space-y-3">
        {/* Category Icon */}
        <div className="flex items-center space-x-2">
          <CategoryIcon category={goal.category} />
          <span className="text-sm text-text-tertiary uppercase">
            {goal.category}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-medium text-text-primary">
          {goal.title}
        </h3>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Progress</span>
            <span className="text-text-primary font-medium">
              {goal.currentProgress}%
            </span>
          </div>
          <ProgressBar value={goal.currentProgress} max={100} />
        </div>
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-text-tertiary">
          <span>Target: {goal.timeHorizon}</span>
          <span>Updated {formatDate(goal.updatedAt)}</span>
        </div>
      </div>
    </Card>
  )
}
```

---

### 5.4 Progress Bar

```tsx
interface ProgressBarProps {
  value: number
  max: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
}

export function ProgressBar({ 
  value, 
  max, 
  variant = 'default',
  showLabel = false 
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100)
  
  const colors = {
    default: 'bg-accent-primary',
    success: 'bg-success-text',
    warning: 'bg-warning-text',
    error: 'bg-error-text',
  }
  
  return (
    <div className="w-full space-y-1">
      <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[variant]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
```

---

### 5.5 Alerts & Toasts

#### Alert

```tsx
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  onDismiss?: () => void
}

export function Alert({ type, title, message, onDismiss }: AlertProps) {
  const styles = {
    success: 'bg-success-bg border-success-border text-success-text',
    warning: 'bg-warning-bg border-warning-border text-warning-text',
    error: 'bg-error-bg border-error-border text-error-text',
    info: 'bg-info-bg border-info-border text-info-text',
  }
  
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  }
  
  return (
    <div className={`p-4 border rounded-lg ${styles[type]}`}>
      <div className="flex items-start space-x-3">
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1 space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-xl hover:opacity-70">
            ×
          </button>
        )}
      </div>
    </div>
  )
}
```

---

### 5.6 Modal

```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-bg-secondary border border-border-default rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-2xl font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Usage
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Update Progress"
  footer={
    <>
      <SecondaryButton onClick={() => setIsOpen(false)}>
        Cancel
      </SecondaryButton>
      <PrimaryButton onClick={handleSave}>
        Save
      </PrimaryButton>
    </>
  }
>
  <Input
    label="Progress (%)"
    type="number"
    value={progress}
    onChange={setProgress}
  />
</Modal>
```

---

## 6. ICONS & IMAGERY

### Icon System

Use [Lucide React](https://lucide.dev/) for consistent icons:

```bash
npm install lucide-react
```

```tsx
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Info,
  ChevronRight,
  Plus,
  Settings,
  User
} from 'lucide-react'

// Usage
<CheckCircle className="w-5 h-5 text-success-text" />
<AlertTriangle className="w-5 h-5 text-warning-text" />
```

### Category Icons

```tsx
const categoryIcons = {
  faith: '📖',
  character: '⚡',
  health: '💪',
  finance: '💰',
  business: '📊',
  relationships: '👥',
}

export function CategoryIcon({ category }: { category: string }) {
  return (
    <span className="text-2xl">
      {categoryIcons[category]}
    </span>
  )
}
```

### Profile Photos

```tsx
export function Avatar({ src, alt, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }
  
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-bg-tertiary`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-text-tertiary">
          <User className="w-1/2 h-1/2" />
        </div>
      )}
    </div>
  )
}
```

---

## 7. ANIMATION & TRANSITIONS

### Principles

- **Subtle, not showy**
- **Fast (200-300ms)**
- **Purposeful** (indicates state change)
- **Skippable** (respects prefers-reduced-motion)

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 200ms ease-in-out;
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 300ms ease-out;
}

/* Pulse (for loading states) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Transition Classes

```css
/* Tailwind transitions */
.transition-colors { transition: color, background-color, border-color 200ms }
.transition-transform { transition: transform 300ms }
.transition-opacity { transition: opacity 200ms }
```

---

## 8. ACCESSIBILITY

### Focus States

```css
/* All interactive elements */
.focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Buttons */
button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Inputs */
input:focus,
textarea:focus,
select:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--accent-primary);
}
```

### ARIA Labels

```tsx
// Icon buttons
<button aria-label="Close modal">
  <X className="w-5 h-5" />
</button>

// Form inputs
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// Progress bars
<div role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
  {/* Progress bar visual */}
</div>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. RESPONSIVE DESIGN

### Mobile-First Approach

```tsx
// Stack vertically on mobile, horizontal on desktop
<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Full width on mobile, fixed width on desktop
<div className="w-full md:w-96">
  <Card>...</Card>
</div>

// Hide on mobile, show on desktop
<div className="hidden md:block">
  Sidebar content
</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">
  Mobile menu
</div>
```

### Touch Targets

```css
/* Minimum 44x44px for touch targets */
button, a {
  min-height: 44px;
  min-width: 44px;
}
```

---

## 10. TAILWIND CONFIGURATION

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F0F0F',
          secondary: '#1A1A1A',
          tertiary: '#2A2A2A',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#B3B3B3',
          tertiary: '#808080',
        },
        accent: {
          primary: '#B08968',
          hover: '#C9A57B',
          active: '#927048',
        },
        border: {
          subtle: '#2A2A2A',
          default: '#404040',
          strong: '#5A5A5A',
        },
        success: {
          bg: '#1A2E1A',
          border: '#2D4A2D',
          text: '#7FD17F',
        },
        warning: {
          bg: '#2E2A1A',
          border: '#4A442D',
          text: '#FFD166',
        },
        error: {
          bg: '#2E1A1A',
          border: '#4A2D2D',
          text: '#FF6B6B',
        },
        info: {
          bg: '#1A1F2E',
          border: '#2D3A4A',
          text: '#6BA3FF',
        },
        category: {
          faith: '#7A6F9E',
          character: '#9E7A6F',
          health: '#6F9E7A',
          finance: '#9E8F6F',
          business: '#7A8F9E',
          relationships: '#9E6F8F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '5xl': ['48px', '56px'],
        '4xl': ['36px', '44px'],
        '3xl': ['30px', '38px'],
        '2xl': ['24px', '32px'],
        'xl': ['20px', '28px'],
        'lg': ['18px', '26px'],
        'base': ['16px', '24px'],
        'sm': ['14px', '20px'],
        'xs': ['12px', '16px'],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### Global Styles

**File:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border-default;
  }
  
  body {
    @apply bg-bg-primary text-text-primary;
    font-family: 'Inter', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply text-text-primary font-semibold;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

---

**END OF UI COMPONENTS & BRANDING DOCUMENT**

Complete design system with color palette, typography, spacing, component library (buttons, forms, cards, modals, etc.), icons, animations, accessibility, responsive patterns, and Tailwind configuration. Next: Build Order.