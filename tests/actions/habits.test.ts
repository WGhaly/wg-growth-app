import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockAuth = vi.fn();

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ auth: mockAuth }));

describe('Habits Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { id: 'test-user-id' } });
  });

  describe('createHabit', () => {
    it('should create a habit with valid data', async () => {
      const mockHabit = {
        id: 'habit-123',
        name: 'Exercise Daily',
        type: 'good',
        frequency: 'daily',
        measurement: 'binary',
        userId: 'test-user-id',
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockHabit]),
        }),
      });

      // Import after mocks are set up
      const { createHabit } = await import('@/actions/habits');

      const result = await createHabit({
        name: 'Exercise Daily',
        type: 'good',
        frequency: 'daily',
        measurement: 'binary',
        targetCount: 1,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHabit);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should fail when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const { createHabit } = await import('@/actions/habits');

      const result = await createHabit({
        name: 'Exercise Daily',
        type: 'build',
        frequency: 'daily',
        targetCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });

    it('should validate required fields', async () => {
      const { createHabit } = await import('@/actions/habits');

      const result = await createHabit({
        name: '',
        type: 'good',
        frequency: 'daily',
        measurement: 'binary',
        targetCount: 1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });
  });

  describe('logHabit', () => {
    it('should log a habit completion', async () => {
      const mockLog = {
        id: 'log-123',
        habitId: 'habit-123',
        userId: 'test-user-id',
        completedAt: new Date().toISOString(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockLog]),
        }),
      });

      const { logHabit } = await import('@/actions/habits');

      const result = await logHabit('habit-123', new Date().toISOString());

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLog);
    });
  });

  describe('getHabits', () => {
    it('should return user habits', async () => {
      const mockHabits = [
        { id: 'habit-1', name: 'Exercise', type: 'build' },
        { id: 'habit-2', name: 'No Smoking', type: 'break' },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockHabits),
        }),
      });

      const { getHabits } = await import('@/actions/habits');

      const result = await getHabits();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(mockHabits);
    });
  });

  describe('deleteHabit', () => {
    it('should delete a habit', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      const { deleteHabit } = await import('@/actions/habits');

      const result = await deleteHabit('habit-123');

      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
