import { z } from 'zod';

// ============================================================================
// Authentication Validators
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

// ============================================================================
// Profile Validators
// ============================================================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  currentYearTheme: z.string().max(255).optional(),
  currentSeasonDescription: z.string().optional(),
  timezone: z.string().max(100).optional()
});

// ============================================================================
// Identity Validators
// ============================================================================

export const manifestoSchema = z.object({
  content: z.string().min(10, 'Manifesto must be at least 10 characters').max(10000)
});

export const valueSchema = z.object({
  id: z.string().uuid().optional(),
  value: z.string().min(1, 'Value is required').max(100),
  rank: z.number().int().min(1).max(10),
  description: z.string().max(1000).optional()
});

export const faithCommitmentSchema = z.object({
  commitmentText: z.string().min(10, 'Commitment must be at least 10 characters').max(10000),
  bibleReadingPlan: z.string().max(255).optional()
});

// ============================================================================
// Goal Validators
// ============================================================================

export const goalSchema = z.object({
  category: z.enum(['faith', 'character', 'health', 'finance', 'business', 'relationships']),
  timeHorizon: z.enum(['1-month', '3-month', '6-month', '1-year', '5-year', 'lifetime']),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(10000).optional(),
  
  // NEW: Required reflective fields per master doc
  whyItMatters: z.string().min(10, 'Why this matters must be at least 10 characters').max(5000),
  successCriteria: z.string().min(10, 'Success criteria must be at least 10 characters').max(5000),
  
  // NEW: Progress tracking
  currentProgress: z.number().int().min(0).max(100).optional(),
  measurementMethod: z.string().max(255).optional(),
  
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  
  // NEW: Life season linkage
  lifeSeasonId: z.string().uuid().optional()
});

export const updateGoalSchema = goalSchema.extend({
  status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']).optional(),
  abandonReason: z.string().max(1000).optional(),
  completionReflection: z.string().max(5000).optional(),
  archivedAt: z.string().datetime().optional()
}).partial();

export const goalMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional()
});

// ============================================================================
// Routine Validators
// ============================================================================

export const routineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.enum(['daily', 'weekly', 'monthly']),
  targetTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  minimumDuration: z.number().int().min(1).optional(),
  idealDuration: z.number().int().min(1).optional(),
  items: z.array(z.object({
    itemText: z.string().min(1).max(500),
    rank: z.number().int().min(1)
  })).min(1, 'At least one item is required')
});

export const routineCompletionSchema = z.object({
  routineId: z.string().uuid(),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  completionLevel: z.enum(['none', 'minimum', 'ideal']),
  duration: z.number().int().min(1).optional(),
  notes: z.string().max(10000).optional()
});

// ============================================================================
// Habit Validators
// ============================================================================

export const habitSchema = z.object({
  type: z.enum(['good', 'bad']),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(10000).optional(),
  measurement: z.enum(['binary', 'count', 'duration', 'scale']),
  targetValue: z.number().int().min(1).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

export const habitLogSchema = z.object({
  habitId: z.string().uuid(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  value: z.number().int().optional(),
  notes: z.string().max(10000).optional()
});

// ============================================================================
// People (Relationships) Validators
// ============================================================================

export const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  relationshipType: z.enum(['friend', 'family', 'partner', 'potential_partner', 'business_partner', 'ex', 'mentor', 'accountability']),
  circle: z.enum(['inner', 'middle', 'outer', 'distant']),
  trustLevel: z.enum(['high', 'medium', 'low', 'none']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  phoneNumber: z.string().max(20).optional(),
  email: z.string().email().optional(),
  notes: z.string().max(10000).optional()
});

export const interactionSchema = z.object({
  personId: z.string().uuid(),
  interactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid ISO date format'),
  summary: z.string().min(1, 'Summary is required').max(10000),
  emotionalImpact: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative'])
});

// ============================================================================
// Prayer Validators
// ============================================================================

export const prayerItemSchema = z.object({
  personId: z.string().uuid().optional(),
  request: z.string().min(1, 'Request is required').max(10000),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'as_needed']),
  status: z.enum(['praying', 'answered', 'no_longer_relevant']).optional()
});

export const updatePrayerItemSchema = prayerItemSchema.extend({
  answeredDetails: z.string().max(10000).optional()
});

// ============================================================================
// Finance Validators
// ============================================================================

export const financialAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').max(255),
  accountType: z.string().min(1, 'Account type is required').max(100),
  balance: z.number().min(0),
  currency: z.string().length(3).optional()
});

export const investmentSchema = z.object({
  type: z.enum(['stocks', 'bonds', 'crypto', 'real_estate', 'business', 'other']),
  name: z.string().min(1, 'Name is required').max(255),
  symbol: z.string().max(20).optional(),
  quantity: z.number().min(0).optional(),
  purchasePrice: z.number().min(0).optional(),
  currentPrice: z.number().min(0).optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  notes: z.string().max(10000).optional()
});

// ============================================================================
// Business Validators
// ============================================================================

export const companySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  status: z.enum(['active', 'paused', 'sold', 'closed']),
  industry: z.string().max(255).optional(),
  foundedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  currentRevenue: z.number().min(0).optional(),
  notes: z.string().max(10000).optional()
});

export const revenueLogSchema = z.object({
  companyId: z.string().uuid(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  amount: z.number().min(0),
  notes: z.string().max(10000).optional()
});

// ============================================================================
// Notification Validators
// ============================================================================

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

// ============================================================================
// Multi-Account Finance Validators
// ============================================================================

export const cashAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').max(255),
  accountType: z.string().min(1, 'Account type is required').max(50),
  currentBalance: z.number().optional(),
  interestRate: z.number().min(0).max(100).optional(), // Interest rate for loans/debts (0-100%)
  isActive: z.boolean().optional(),
  notes: z.string().max(10000).optional()
});

export const updateCashAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').max(255).optional(),
  accountType: z.string().max(50).optional(),
  currentBalance: z.number().optional(),
  interestRate: z.number().min(0).max(100).optional(), // Interest rate for loans/debts (0-100%)
  isActive: z.boolean().optional(),
  notes: z.string().max(10000).optional()
});

export const savingsGoalSchema = z.object({
  goalName: z.string().min(1, 'Goal name is required').max(255),
  targetAmount: z.number().min(0.01, 'Target amount must be greater than 0'),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(10000).optional()
});

export const updateSavingsGoalSchema = z.object({
  goalName: z.string().min(1, 'Goal name is required').max(255).optional(),
  targetAmount: z.number().min(0.01, 'Target amount must be greater than 0').optional(),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(10000).optional()
});

// Account types for dropdown
export const ACCOUNT_TYPES = [
  'checking',
  'savings',
  'cash',
  'credit_card',
  'investment',
  'debt',
  'loan',
  'other'
] as const;

// ============================================================================
// Type Exports
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ManifestoInput = z.infer<typeof manifestoSchema>;
export type ValueInput = z.infer<typeof valueSchema>;
export type FaithCommitmentInput = z.infer<typeof faithCommitmentSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalMilestoneInput = z.infer<typeof goalMilestoneSchema>;
// ============================================================================
// Life Seasons Validators
// ============================================================================

export const lifeSeasonSchema = z.object({
  seasonName: z.string()
    .min(3, 'Season name must be at least 3 characters')
    .max(255, 'Season name is too long'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  keyLearnings: z.string().optional(),
  definingMoments: z.string().optional(),
  annualTheme: z.string().max(255).optional(),
  isCurrent: z.boolean().optional()
});

export const updateLifeSeasonSchema = lifeSeasonSchema.partial();

// ============================================================================
// Accountability System Validators
// ============================================================================

const permissionScopes = [
  'profile', 'identity', 'goals', 'routines', 'habits', 
  'habits_good', 'habits_bad', 'relationships', 'prayer', 
  'finance', 'business', 'insights'
] as const;

export const createInviteSchema = z.object({
  inviteeEmail: z.string().email('Invalid email address'),
  scopes: z.array(z.enum(permissionScopes))
    .min(1, 'At least one permission scope is required')
    .max(12, 'Too many scopes selected'),
  expiresInDays: z.number().int().min(1).max(30).default(7)
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required')
});

export const updateAccountabilityLinkSchema = z.object({
  scopes: z.array(z.enum(permissionScopes)).optional(),
  status: z.enum(['pending', 'active', 'revoked']).optional(),
  revocationReason: z.string().optional()
});

export const createAccountabilityCommentSchema = z.object({
  resourceType: z.string().min(1, 'Resource type is required'),
  resourceId: z.string().uuid('Invalid resource ID'),
  comment: z.string()
    .min(3, 'Comment must be at least 3 characters')
    .max(5000, 'Comment is too long'),
  isPrayer: z.boolean().default(false)
});

export const acknowledgeAlertSchema = z.object({
  alertId: z.string().uuid('Invalid alert ID')
});

export type RoutineInput = z.infer<typeof routineSchema>;
export type RoutineCompletionInput = z.infer<typeof routineCompletionSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
export type PersonInput = z.infer<typeof personSchema>;
export type InteractionInput = z.infer<typeof interactionSchema>;
export type PrayerItemInput = z.infer<typeof prayerItemSchema>;
export type UpdatePrayerItemInput = z.infer<typeof updatePrayerItemSchema>;
export type FinancialAccountInput = z.infer<typeof financialAccountSchema>;
export type InvestmentInput = z.infer<typeof investmentSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type RevenueLogInput = z.infer<typeof revenueLogSchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type LifeSeasonInput = z.infer<typeof lifeSeasonSchema>;
export type UpdateLifeSeasonInput = z.infer<typeof updateLifeSeasonSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type UpdateAccountabilityLinkInput = z.infer<typeof updateAccountabilityLinkSchema>;
export type CreateAccountabilityCommentInput = z.infer<typeof createAccountabilityCommentSchema>;
export type AcknowledgeAlertInput = z.infer<typeof acknowledgeAlertSchema>;
export type CashAccountInput = z.infer<typeof cashAccountSchema>;
export type UpdateCashAccountInput = z.infer<typeof updateCashAccountSchema>;
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
