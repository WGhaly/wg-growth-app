'use client';

import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface MobileFilterSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showAsButtons?: boolean; // Force button display even on mobile
}

export function MobileFilterSelect({
  options,
  value,
  onChange,
  label,
  showAsButtons = false,
}: MobileFilterSelectProps) {
  const shouldShowButtons = showAsButtons || options.length <= 3;

  // Mobile: Styled select dropdown (cleaner, no horizontal scroll)
  // Desktop: Buttons for visual appeal (if <= 5 options)
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}

      {/* Mobile Dropdown */}
      <div className={`${shouldShowButtons ? 'hidden' : 'block md:hidden'}`}>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none bg-bg-secondary border border-border-default rounded-lg px-4 py-3 pr-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
                {option.count !== undefined ? ` (${option.count})` : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={20} className="text-text-tertiary" />
          </div>
        </div>
      </div>

      {/* Desktop Buttons (or mobile if 3 or fewer options) */}
      <div
        className={`${
          shouldShowButtons 
            ? 'flex flex-wrap gap-2' 
            : 'hidden md:flex md:flex-wrap md:gap-2'
        }`}
      >
        {options.map((option) => {
          const isActive = value === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#ccab52]/10 border-[#ccab52] text-[#ccab52]'
                  : 'bg-white/5 border-white/10 text-text-tertiary hover:bg-white/10'
              }`}
            >
              {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
              <span className="text-sm font-medium">{option.label}</span>
              {option.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#ccab52]/20' : 'bg-white/10'
                  }`}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
