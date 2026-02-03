'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: 'red' | 'green' | 'blue' | 'yellow';
  onClick: () => void;
}

interface SwipeActionsProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
}

const colorClasses = {
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-white',
  blue: 'bg-blue-500 text-white',
  yellow: 'bg-yellow-500 text-white',
};

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  className = '',
}: SwipeActionsProps) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsWidth = 80; // Width per action

  useEffect(() => {
    // Auto-close after inactivity
    if (offset !== 0) {
      const timer = setTimeout(() => setOffset(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [offset]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const maxLeft = leftActions.length * actionsWidth;
    const maxRight = rightActions.length * actionsWidth;
    
    // Constrain swipe distance
    if (diff > 0) {
      setOffset(Math.min(diff, maxLeft));
    } else {
      setOffset(Math.max(diff, -maxRight));
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    // Snap to action threshold or closed
    const threshold = actionsWidth * 0.5;
    
    if (offset > threshold && leftActions.length > 0) {
      setOffset(actionsWidth);
    } else if (offset < -threshold && rightActions.length > 0) {
      setOffset(-actionsWidth);
    } else {
      setOffset(0);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setOffset(0);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-stretch"
          style={{ width: `${leftActions.length * actionsWidth}px` }}
        >
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 ${colorClasses[action.color]} transition-opacity`}
              style={{ opacity: Math.min(Math.abs(offset) / actionsWidth, 1) }}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-stretch"
          style={{ width: `${rightActions.length * actionsWidth}px` }}
        >
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 ${colorClasses[action.color]} transition-opacity`}
              style={{ opacity: Math.min(Math.abs(offset) / actionsWidth, 1) }}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Swipeable Content */}
      <div
        className="relative bg-bg-secondary transition-transform touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transitionDuration: isSwiping ? '0ms' : '200ms',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
