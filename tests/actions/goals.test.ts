import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockAuth = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

describe('Goals Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: 'test-user-id' } });
  });

  describe('createGoal', () => {
    it('should create a goal with valid data', async () => {
      const mockGoal = {
        id: 'goal-123',
        title: 'Learn TypeScript',
        status: 'not_started',
        category: 'character',
        timeHorizon: 'yearly',
        userId: 'test-user-id',
        targetDate: '2026-12-31',
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockGoal]),
        }),
      });

      const { createGoal } = await import('@/actions/goals');

      const result = await createGoal({
        title: 'Learn TypeScript',
        description: 'Master TypeScript fundamentals',
        category: 'character',
        timeHorizon: 'yearly',
        targetDate: '2026-12-31',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGoal);
    });

    it('should fail without authentication', async () => {
      mockAuth.mockResolvedValue(null);

      const { createGoal } = await import('@/actions/goals');

      const result = await createGoal({
        title: 'Learn TypeScript',
        category: 'character',
        timeHorizon: 'yearly',
        targetDate: '2026-12-31',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });

  describe('updateGoalStatus', () => {
    it('should update goal status', async () => {
      const mockUpdatedGoal = {
        id: 'goal-123',
        status: 'in_progress',
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedGoal]),
          }),
        }),
      });

      const { updateGoalStatus } = await import('@/actions/goals');

      const result = await updateGoalStatus('goal-123', 'in_progress');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('in_progress');
    });
  });

  describe('getGoals', () => {
    it('should return user goals', async () => {
      const mockGoals = [
        { id: 'goal-1', title: 'Goal 1', status: 'in_progress' },
        { id: 'goal-2', title: 'Goal 2', status: 'completed' },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockGoals),
        }),
      });

      const { getGoals } = await import('@/actions/goals');

      const result = await getGoals();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });
});
