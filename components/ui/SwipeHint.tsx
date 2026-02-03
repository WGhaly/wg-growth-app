'use client';

import { useState, useEffect } from 'react';
import { X, Hand } from 'lucide-react';

interface SwipeHintProps {
  storageKey?: string;
  message?: string;
}

export function SwipeHint({ 
  storageKey = 'swipe-hint-dismissed',
  message = 'Swipe left or right on cards for quick actions!'
}: SwipeHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this hint before
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      // Show hint after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 left-4 right-4 z-50 md:hidden">
      <div className="bg-[#ccab52] text-white rounded-lg shadow-lg p-4 flex items-center gap-3 animate-bounce-subtle">
        <div className="flex-shrink-0">
          <Hand size={24} />
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss hint"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
