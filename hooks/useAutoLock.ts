'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

const AUTO_LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export function useAutoLock() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset inactivity timer
  const resetTimer = () => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsLocked(true);
      router.push('/auth/auto-lock');
    }, AUTO_LOCK_DURATION);
  };

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      if (!isLocked) {
        resetTimer();
      }
    };

    // Set up event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, isLocked]);

  // Check if session has expired on app visibility change
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        if (timeSinceLastActivity > AUTO_LOCK_DURATION) {
          setIsLocked(true);
          router.push('/auth/auto-lock');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const unlock = () => {
    setIsLocked(false);
    resetTimer();
  };

  return {
    isLocked,
    unlock,
    resetTimer
  };
}
