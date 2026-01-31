// Test utilities and helpers

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

export const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const createMockHabit = (overrides = {}) => ({
  id: 'habit-123',
  userId: 'test-user-id',
  name: 'Test Habit',
  type: 'good' as const,
  frequency: 'daily' as const,
  measurement: 'binary' as const,
  targetCount: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockRoutine = (overrides = {}) => ({
  id: 'routine-123',
  userId: 'test-user-id',
  name: 'Morning Routine',
  type: 'daily' as const,
  targetTime: '07:00',
  minimumDuration: 30,
  idealDuration: 60,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockGoal = (overrides = {}) => ({
  id: 'goal-123',
  userId: 'test-user-id',
  title: 'Test Goal',
  description: 'Test goal description',
  status: 'not_started' as const,
  priority: 'medium' as const,
  category: 'character' as const,
  timeHorizon: 'yearly' as const,
  targetDate: '2026-12-31',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockInsight = (overrides = {}) => ({
  id: 'insight-123',
  type: 'achievement' as const,
  category: 'habits' as const,
  title: 'Great Progress!',
  description: 'You completed 20 habits this week',
  priority: 'high' as const,
  actionable: false,
  data: {},
  ...overrides,
});

// Wait for async updates
export const waitFor = (callback: () => void, timeout = 1000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      try {
        callback();
        clearInterval(interval);
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(error);
        }
      }
    }, 50);
  });
};
