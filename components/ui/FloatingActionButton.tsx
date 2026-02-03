'use client';

import { ReactNode } from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
}

export function FloatingActionButton({
  onClick,
  icon = <Plus size={24} />,
  label,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 bg-[#ccab52] hover:bg-[#b89942] text-white rounded-full shadow-lg active:scale-95 transition-all group"
      style={{
        width: label ? 'auto' : '56px',
        height: '56px',
        padding: label ? '0 20px' : '0',
      }}
      aria-label={label || 'Add'}
    >
      <div className="flex items-center justify-center gap-2">
        {icon}
        {label && (
          <span className="font-medium text-sm whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
    </button>
  );
}
