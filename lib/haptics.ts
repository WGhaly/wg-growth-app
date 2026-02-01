/**
 * Haptic Feedback Utilities for Mobile Devices
 * Provides tactile feedback for user interactions
 */

type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const haptics = {
  /**
   * Trigger haptic feedback (vibration) on supported devices
   */
  trigger: (type: HapticFeedbackType = 'light') => {
    // Check if running in browser and if vibration API is supported
    if (typeof window === 'undefined' || !navigator.vibrate) {
      return;
    }

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      // Silently fail if vibration not supported
      console.debug('Haptic feedback not supported');
    }
  },

  /**
   * Cancel any ongoing vibration
   */
  cancel: () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(0);
    }
  },

  /**
   * Check if haptic feedback is supported
   */
  isSupported: () => {
    return typeof window !== 'undefined' && 'vibrate' in navigator;
  },
};

/**
 * Convenience methods for common interactions
 */
export const feedback = {
  tap: () => haptics.trigger('light'),
  buttonPress: () => haptics.trigger('medium'),
  toggle: () => haptics.trigger('light'),
  success: () => haptics.trigger('success'),
  error: () => haptics.trigger('error'),
  warning: () => haptics.trigger('warning'),
  longPress: () => haptics.trigger('heavy'),
};
