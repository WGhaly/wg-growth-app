import { pgTable, uuid, varchar, boolean, text, timestamp, integer, date, decimal, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('user_role', ['owner', 'point_of_light', 'secondary_user']);
export const goalCategoryEnum = pgEnum('goal_category', ['faith', 'character', 'health', 'finance', 'business', 'relationships']);
export const goalStatusEnum = pgEnum('goal_status', ['not_started', 'in_progress', 'completed', 'abandoned']);
export const timeHorizonEnum = pgEnum('time_horizon', ['1-month', '3-month', '6-month', '1-year', '5-year', 'lifetime']);
export const routineTypeEnum = pgEnum('routine_type', ['daily', 'weekly', 'monthly']);
export const routineCompletionLevelEnum = pgEnum('routine_completion_level', ['none', 'minimum', 'ideal']);
export const habitTypeEnum = pgEnum('habit_type', ['good', 'bad']);
export const habitMeasurementEnum = pgEnum('habit_measurement', ['binary', 'count', 'duration', 'scale']);
export const relationshipTypeEnum = pgEnum('relationship_type', ['friend', 'family', 'partner', 'potential_partner', 'business_partner', 'ex', 'mentor', 'accountability']);
export const relationshipCircleEnum = pgEnum('relationship_circle', ['inner', 'middle', 'outer', 'distant']);
export const trustLevelEnum = pgEnum('trust_level', ['high', 'medium', 'low', 'none']);
export const emotionalImpactEnum = pgEnum('emotional_impact', ['very_positive', 'positive', 'neutral', 'negative', 'very_negative']);
export const prayerFrequencyEnum = pgEnum('prayer_frequency', ['daily', 'weekly', 'monthly', 'as_needed']);
export const prayerStatusEnum = pgEnum('prayer_status', ['praying', 'answered', 'no_longer_relevant']);
export const investmentTypeEnum = pgEnum('investment_type', ['stocks', 'bonds', 'crypto', 'real_estate', 'business', 'other']);
export const companyStatusEnum = pgEnum('company_status', ['active', 'paused', 'sold', 'closed']);
export const insightCategoryEnum = pgEnum('insight_category', ['behavioral', 'financial', 'relationship', 'faith', 'health']);
export const insightSeverityEnum = pgEnum('insight_severity', ['info', 'warning', 'critical']);
export const notificationTypeEnum = pgEnum('notification_type', ['routine_reminder', 'reflection_prompt', 'insight_alert', 'accountability_alert', 'birthday', 'goal_milestone']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'failed', 'read']);
export const permissionScopeEnum = pgEnum('permission_scope', ['profile', 'identity', 'goals', 'routines', 'habits', 'habits_good', 'habits_bad', 'relationships', 'prayer', 'finance', 'business', 'insights']);

// ============================================================================
// CORE TABLES
// ============================================================================

// Users & Authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('owner').notNull(),
  
  // WebAuthn / Passkeys
  webauthnCredentials: jsonb('webauthn_credentials').default([]),
  webauthnChallenge: varchar('webauthn_challenge', { length: 255 }),
  biometricEnabled: boolean('biometric_enabled').default(false),
  
  // Session Management
  lastActivity: timestamp('last_activity', { withTimezone: true }),
  lastBiometricVerification: timestamp('last_biometric_verification', { withTimezone: true }),
  sessionExpiresAt: timestamp('session_expires_at', { withTimezone: true }),
  
  // Account Status
  isActive: boolean('is_active').default(true),
  isLocked: boolean('is_locked').default(false),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  
  // Identity & Values
  manifesto: text('manifesto'),
  faithCommitment: text('faith_commitment'),
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true })
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  activeIdx: index('idx_users_active').on(table.id),
  sessionIdx: index('idx_users_session').on(table.id, table.sessionExpiresAt)
}));

// User Profiles
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Basic Info
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  
  // Life Season
  currentYearTheme: varchar('current_year_theme', { length: 255 }),
  currentSeasonDescription: text('current_season_description'),
  timezone: varchar('timezone', { length: 100 }).default('America/New_York').notNull(),
  
  // Preferences
  notificationPreferences: jsonb('notification_preferences').default({}),
  
  // New fields from migration 003
  faith: varchar('faith', { length: 255 }).default('christian_biblical'),
  reflectionDepthPreference: varchar('reflection_depth_preference', { length: 50 }),
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_profiles_user_id').on(table.userId)
}));

// Identity: Identity Statements (formerly manifestos - restructured in migration 003)
export const identityStatements = pgTable('identity_statements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  personalManifesto: text('personal_manifesto'),
  manIAmBecoming: text('man_i_am_becoming'),
  callingStatement: text('calling_statement'),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_identity_statements_user_id').on(table.userId)
}));

// Keep old manifestos export for backward compatibility (pointing to same table)
export const manifestos = identityStatements;

// Identity: Values
export const values = pgTable('values', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  value: varchar('value', { length: 100 }).notNull(),
  rank: integer('rank').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_values_user_id').on(table.userId),
  rankIdx: index('idx_values_rank').on(table.userId, table.rank)
}));

// Identity: Faith Commitments
export const faithCommitments = pgTable('faith_commitments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  commitmentText: text('commitment_text').notNull(),
  bibleReadingPlan: varchar('bible_reading_plan', { length: 255 }),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_faith_commitments_user_id').on(table.userId)
}));

// Goals
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: goalCategoryEnum('category').notNull(),
  timeHorizon: timeHorizonEnum('time_horizon').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  // NEW: Required reflective fields per master doc
  whyItMatters: text('why_it_matters').notNull(),
  successCriteria: text('success_criteria').notNull(),
  
  // NEW: Progress tracking
  currentProgress: integer('current_progress').default(0).notNull(),
  measurementMethod: varchar('measurement_method', { length: 255 }),
  
  // Status fields
  status: goalStatusEnum('status').default('not_started').notNull(),
  targetDate: date('target_date'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completionReflection: text('completion_reflection'),
  abandonedAt: timestamp('abandoned_at', { withTimezone: true }),
  abandonReason: text('abandon_reason'),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  
  // NEW: Life season linkage
  lifeSeasonId: uuid('life_season_id'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_goals_user_id').on(table.userId),
  categoryIdx: index('idx_goals_category').on(table.userId, table.category),
  statusIdx: index('idx_goals_status').on(table.userId, table.status)
}));

// Goal Milestones
export const goalMilestones = pgTable('goal_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  dueDate: date('due_date'),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  goalIdIdx: index('idx_goal_milestones_goal_id').on(table.goalId)
}));

// Goal-Habits Junction Table (Goals can be linked to supporting habits)
export const goalHabits = pgTable('goal_habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  habitId: uuid('habit_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  goalIdIdx: index('idx_goal_habits_goal_id').on(table.goalId),
  habitIdIdx: index('idx_goal_habits_habit_id').on(table.habitId),
  uniquePair: uniqueIndex('idx_goal_habits_unique').on(table.goalId, table.habitId)
}));

// Goal-Routines Junction Table (Goals can be linked to supporting routines)
export const goalRoutines = pgTable('goal_routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  routineId: uuid('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  goalIdIdx: index('idx_goal_routines_goal_id').on(table.goalId),
  routineIdIdx: index('idx_goal_routines_routine_id').on(table.routineId),
  uniquePair: uniqueIndex('idx_goal_routines_unique').on(table.goalId, table.routineId)
}));

// Routines
export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: routineTypeEnum('type').notNull(),
  targetTime: varchar('target_time', { length: 10 }),
  minimumDuration: integer('minimum_duration'),
  idealDuration: integer('ideal_duration'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_routines_user_id').on(table.userId),
  activeIdx: index('idx_routines_active').on(table.userId, table.isActive)
}));

// Routine Items
export const routineItems = pgTable('routine_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  routineId: uuid('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  itemText: varchar('item_text', { length: 500 }).notNull(),
  rank: integer('rank').notNull(),
  // New fields from migration 003
  isMinimumStandard: boolean('is_minimum_standard').default(false),
  isIdealOnly: boolean('is_ideal_only').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  routineIdIdx: index('idx_routine_items_routine_id').on(table.routineId),
  rankIdx: index('idx_routine_items_rank').on(table.routineId, table.rank)
}));

// Routine Completions
export const routineCompletions = pgTable('routine_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  routineId: uuid('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  completionDate: date('completion_date').notNull(),
  completionLevel: routineCompletionLevelEnum('completion_level').notNull(),
  duration: integer('duration'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  routineIdIdx: index('idx_routine_completions_routine_id').on(table.routineId),
  dateIdx: index('idx_routine_completions_date').on(table.completionDate),
  uniqueCompletion: uniqueIndex('idx_routine_completions_unique').on(table.routineId, table.completionDate)
}));

// Habits
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: habitTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  measurement: habitMeasurementEnum('measurement').notNull(),
  targetValue: integer('target_value'),
  isActive: boolean('is_active').default(true),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  // New fields from migration 003 - Bad Habit Spiritual Tracking
  triggerDescription: text('trigger_description'),
  emotionalCost: text('emotional_cost'),
  spiritualCost: text('spiritual_cost'),
  replacementHabit: text('replacement_habit'),
  reductionTarget: integer('reduction_target'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_habits_user_id').on(table.userId),
  typeIdx: index('idx_habits_type').on(table.userId, table.type),
  activeIdx: index('idx_habits_active').on(table.userId, table.isActive)
}));

// Habit Logs
export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  logDate: date('log_date').notNull(),
  value: integer('value'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  habitIdIdx: index('idx_habit_logs_habit_id').on(table.habitId),
  dateIdx: index('idx_habit_logs_date').on(table.logDate),
  uniqueLog: uniqueIndex('idx_habit_logs_unique').on(table.habitId, table.logDate)
}));

// People (Relationships)
export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  relationshipType: relationshipTypeEnum('relationship_type').notNull(),
  circle: relationshipCircleEnum('circle').notNull(),
  trustLevel: trustLevelEnum('trust_level').notNull(),
  dateOfBirth: date('date_of_birth'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  email: varchar('email', { length: 255 }),
  notes: text('notes'),
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  // New fields from migration 003 - Relationship Evaluation
  howWeMet: text('how_we_met'),
  whyIValueThem: text('why_i_value_them'),
  decisionDirection: varchar('decision_direction', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_people_user_id').on(table.userId),
  circleIdx: index('idx_people_circle').on(table.userId, table.circle),
  typeIdx: index('idx_people_type').on(table.userId, table.relationshipType)
}));

// Interactions
export const interactions = pgTable('interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  interactionDate: timestamp('interaction_date', { withTimezone: true }).notNull(),
  summary: text('summary').notNull(),
  emotionalImpact: emotionalImpactEnum('emotional_impact').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  personIdIdx: index('idx_interactions_person_id').on(table.personId),
  dateIdx: index('idx_interactions_date').on(table.interactionDate)
}));

// Prayer List
export const prayerItems = pgTable('prayer_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  personId: uuid('person_id').references(() => people.id, { onDelete: 'set null' }),
  request: text('request').notNull(),
  frequency: prayerFrequencyEnum('frequency').notNull(),
  status: prayerStatusEnum('status').default('praying').notNull(),
  answeredAt: timestamp('answered_at', { withTimezone: true }),
  answeredDetails: text('answered_details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_prayer_items_user_id').on(table.userId),
  statusIdx: index('idx_prayer_items_status').on(table.userId, table.status),
  personIdIdx: index('idx_prayer_items_person_id').on(table.personId)
}));

// Financial Accounts
export const financialAccounts = pgTable('financial_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: varchar('account_type', { length: 100 }).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_financial_accounts_user_id').on(table.userId)
}));

// Investments
export const investments = pgTable('investments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: investmentTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  symbol: varchar('symbol', { length: 20 }),
  quantity: decimal('quantity', { precision: 15, scale: 8 }),
  purchasePrice: decimal('purchase_price', { precision: 15, scale: 2 }),
  currentPrice: decimal('current_price', { precision: 15, scale: 2 }),
  purchaseDate: date('purchase_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_investments_user_id').on(table.userId),
  typeIdx: index('idx_investments_type').on(table.userId, table.type)
}));

// Companies (Business Ventures)
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  status: companyStatusEnum('status').notNull(),
  industry: varchar('industry', { length: 255 }),
  foundedDate: date('founded_date'),
  closedDate: date('closed_date'),
  currentRevenue: decimal('current_revenue', { precision: 15, scale: 2 }), // Legacy field - kept for backwards compatibility
  // New fields from migration 007
  equityPercentage: decimal('equity_percentage', { precision: 5, scale: 2 }), // 0-100%
  valuation: decimal('valuation', { precision: 15, scale: 2 }),
  profits: decimal('profits', { precision: 15, scale: 2 }), // Can be negative
  // Field from migration 003
  accountsPayableLiabilities: decimal('accounts_payable_liabilities', { precision: 15, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_companies_user_id').on(table.userId),
  statusIdx: index('idx_companies_status').on(table.userId, table.status)
}));

// Revenue Logs
export const revenueLogs = pgTable('revenue_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  logDate: date('log_date').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  companyIdIdx: index('idx_revenue_logs_company_id').on(table.companyId),
  dateIdx: index('idx_revenue_logs_date').on(table.logDate)
}));

// Insights
export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: insightCategoryEnum('category').notNull(),
  severity: insightSeverityEnum('severity').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  actionableSteps: jsonb('actionable_steps'),
  isDismissed: boolean('is_dismissed').default(false),
  dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_insights_user_id').on(table.userId),
  categoryIdx: index('idx_insights_category').on(table.userId, table.category),
  severityIdx: index('idx_insights_severity').on(table.userId, table.severity),
  dismissedIdx: index('idx_insights_dismissed').on(table.userId, table.isDismissed)
}));

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  status: notificationStatusEnum('status').default('pending').notNull(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_notifications_user_id').on(table.userId),
  statusIdx: index('idx_notifications_status').on(table.status),
  scheduledIdx: index('idx_notifications_scheduled').on(table.scheduledFor)
}));

// Push Subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_push_subscriptions_user_id').on(table.userId),
  endpointIdx: uniqueIndex('idx_push_subscriptions_endpoint').on(table.endpoint),
  activeIdx: index('idx_push_subscriptions_active').on(table.isActive)
}));

// User Permissions (for Point of Light / Secondary Users)
export const userPermissions = pgTable('user_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  grantedToUserId: uuid('granted_to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scope: permissionScopeEnum('scope').notNull(),
  canView: boolean('can_view').default(false),
  canEdit: boolean('can_edit').default(false),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true })
}, (table) => ({
  ownerIdx: index('idx_user_permissions_owner_id').on(table.ownerId),
  grantedToIdx: index('idx_user_permissions_granted_to').on(table.grantedToUserId),
  scopeIdx: index('idx_user_permissions_scope').on(table.ownerId, table.grantedToUserId, table.scope)
}));

// Activity Log
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_activity_logs_user_id').on(table.userId),
  actionIdx: index('idx_activity_logs_action').on(table.action),
  dateIdx: index('idx_activity_logs_date').on(table.createdAt)
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId]
  }),
  manifesto: one(manifestos, {
    fields: [users.id],
    references: [manifestos.userId]
  }),
  faithCommitment: one(faithCommitments, {
    fields: [users.id],
    references: [faithCommitments.userId]
  }),
  values: many(values),
  goals: many(goals),
  routines: many(routines),
  habits: many(habits),
  people: many(people),
  prayerItems: many(prayerItems),
  financialAccounts: many(financialAccounts),
  investments: many(investments),
  companies: many(companies),
  insights: many(insights),
  notifications: many(notifications),
  pushSubscriptions: many(pushSubscriptions),
  activityLogs: many(activityLogs),
  // New relations from migration 002
  lifeSeasons: many(lifeSeasons),
  ownedAccountabilityLinks: many(accountabilityLinks, { relationName: 'owned_links' }),
  partnerAccountabilityLinks: many(accountabilityLinks, { relationName: 'partner_links' }),
  accountabilityComments: many(accountabilityComments),
  inviteTokens: many(inviteTokens),
  cashAccounts: many(cashAccounts),
  savingsGoals: many(savingsGoals)
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id]
  })
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id]
  }),
  milestones: many(goalMilestones)
}));

export const goalMilestonesRelations = relations(goalMilestones, ({ one }) => ({
  goal: one(goals, {
    fields: [goalMilestones.goalId],
    references: [goals.id]
  })
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  user: one(users, {
    fields: [routines.userId],
    references: [users.id]
  }),
  items: many(routineItems),
  completions: many(routineCompletions)
}));

export const routineItemsRelations = relations(routineItems, ({ one }) => ({
  routine: one(routines, {
    fields: [routineItems.routineId],
    references: [routines.id]
  })
}));

export const routineCompletionsRelations = relations(routineCompletions, ({ one }) => ({
  routine: one(routines, {
    fields: [routineCompletions.routineId],
    references: [routines.id]
  })
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id]
  }),
  logs: many(habitLogs)
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id]
  })
}));

export const peopleRelations = relations(people, ({ one, many }) => ({
  user: one(users, {
    fields: [people.userId],
    references: [users.id]
  }),
  interactions: many(interactions),
  prayerItems: many(prayerItems)
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  person: one(people, {
    fields: [interactions.personId],
    references: [people.id]
  })
}));

export const prayerItemsRelations = relations(prayerItems, ({ one }) => ({
  user: one(users, {
    fields: [prayerItems.userId],
    references: [users.id]
  }),
  person: one(people, {
    fields: [prayerItems.personId],
    references: [people.id]
  })
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id]
  }),
  revenueLogs: many(revenueLogs),
  // New relations from migration 002
  capTableEntries: many(capTableEntries),
  products: many(companyProducts)
}));

export const revenueLogsRelations = relations(revenueLogs, ({ one }) => ({
  company: one(companies, {
    fields: [revenueLogs.companyId],
    references: [companies.id]
  })
}));

// Core Values Table
export const coreValues = pgTable('core_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  description: text('description'),
  rank: integer('rank').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const coreValuesRelations = relations(coreValues, ({ one }) => ({
  user: one(users, {
    fields: [coreValues.userId],
    references: [users.id]
  })
}));

// User Years Table (for yearly themes)
export const userYears = pgTable('user_years', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  year: integer('year').notNull(),
  theme: varchar('theme', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userYearsRelations = relations(userYears, ({ one }) => ({
  user: one(users, {
    fields: [userYears.userId],
    references: [users.id]
  })
}));

// ============================================================================
// NEW TABLES FROM MIGRATION 002 & 003
// ============================================================================

// Life Seasons (Birthday automation foundation)
export const lifeSeasons = pgTable('life_seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seasonName: varchar('season_name', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  keyLearnings: text('key_learnings'),
  definingMoments: text('defining_moments'),
  annualTheme: varchar('annual_theme', { length: 255 }),
  isCurrent: boolean('is_current').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_life_seasons_user_id').on(table.userId),
  currentIdx: index('idx_life_seasons_current').on(table.userId, table.isCurrent)
}));

// Accountability Links
export const accountabilityLinks = pgTable('accountability_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountabilityPartnerId: uuid('accountability_partner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scopesGranted: permissionScopeEnum('scopes_granted').array().notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revocationReason: text('revocation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  ownerIdx: index('idx_accountability_links_owner').on(table.ownerId),
  partnerIdx: index('idx_accountability_links_partner').on(table.accountabilityPartnerId),
  statusIdx: index('idx_accountability_links_status').on(table.status)
}));

// Accountability Comments
export const accountabilityComments = pgTable('accountability_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  linkId: uuid('link_id').notNull().references(() => accountabilityLinks.id, { onDelete: 'cascade' }),
  commenterId: uuid('commenter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: uuid('resource_id').notNull(),
  comment: text('comment').notNull(),
  isPrayer: boolean('is_prayer').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  linkIdx: index('idx_accountability_comments_link').on(table.linkId),
  resourceIdx: index('idx_accountability_comments_resource').on(table.resourceType, table.resourceId),
  commenterIdx: index('idx_accountability_comments_commenter').on(table.commenterId)
}));

// Accountability Alerts
export const accountabilityAlerts = pgTable('accountability_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  linkId: uuid('link_id').notNull().references(() => accountabilityLinks.id, { onDelete: 'cascade' }),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: uuid('resource_id').notNull(),
  message: text('message').notNull(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  linkIdx: index('idx_accountability_alerts_link').on(table.linkId),
  acknowledgedIdx: index('idx_accountability_alerts_acknowledged').on(table.linkId, table.acknowledgedAt)
}));

// Invite Tokens
export const inviteTokens = pgTable('invite_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  inviteeEmail: varchar('invitee_email', { length: 255 }).notNull(),
  scopesOffered: permissionScopeEnum('scopes_offered').array().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  tokenIdx: index('idx_invite_tokens_token').on(table.token),
  ownerIdx: index('idx_invite_tokens_owner').on(table.ownerId),
  expiresIdx: index('idx_invite_tokens_expires').on(table.expiresAt)
}));

// Cash Accounts
export const cashAccounts = pgTable('cash_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: varchar('account_type', { length: 50 }).notNull(),
  currentBalance: decimal('current_balance', { precision: 15, scale: 2 }).default('0').notNull(),
  interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).default('0'), // For loans/debts
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('idx_cash_accounts_user').on(table.userId),
  activeIdx: index('idx_cash_accounts_active').on(table.userId, table.isActive),
  typeIdx: index('idx_cash_accounts_type').on(table.userId, table.accountType)
}));

// Transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => cashAccounts.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  transactionType: varchar('transaction_type', { length: 10 }).notNull(), // 'credit' or 'debit'
  description: text('description'),
  transactionDate: timestamp('transaction_date', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('idx_transactions_user_id').on(table.userId),
  accountIdx: index('idx_transactions_account_id').on(table.accountId),
  dateIdx: index('idx_transactions_date').on(table.userId, table.transactionDate)
}));

// Savings Goals
export const savingsGoals = pgTable('savings_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goalName: varchar('goal_name', { length: 255 }).notNull(),
  targetAmount: decimal('target_amount', { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  targetDate: date('target_date'),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userIdx: index('idx_savings_goals_user').on(table.userId),
  activeIdx: index('idx_savings_goals_active').on(table.userId, table.isActive)
}));

// Cap Table Entries
export const capTableEntries = pgTable('cap_table_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  stakeholderName: varchar('stakeholder_name', { length: 255 }).notNull(),
  stakeholderType: varchar('stakeholder_type', { length: 50 }).notNull(),
  equityPercentage: decimal('equity_percentage', { precision: 5, scale: 2 }).notNull(),
  sharesOwned: integer('shares_owned'),
  investmentAmount: decimal('investment_amount', { precision: 15, scale: 2 }),
  entryDate: date('entry_date').notNull(),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  companyIdx: index('idx_cap_table_company').on(table.companyId),
  activeIdx: index('idx_cap_table_active').on(table.companyId, table.isActive)
}));

// Company Products
export const companyProducts = pgTable('company_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  description: text('description'),
  equitySplit: jsonb('equity_split'),
  revenue: decimal('revenue', { precision: 15, scale: 2 }),
  isActive: boolean('is_active').default(true),
  launchedDate: date('launched_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  companyIdx: index('idx_company_products_company').on(table.companyId),
  activeIdx: index('idx_company_products_active').on(table.companyId, table.isActive)
}));

// ============================================================================
// RELATIONS FOR NEW TABLES
// ============================================================================

export const lifeSeasonsRelations = relations(lifeSeasons, ({ one }) => ({
  user: one(users, {
    fields: [lifeSeasons.userId],
    references: [users.id]
  })
}));

export const accountabilityLinksRelations = relations(accountabilityLinks, ({ one, many }) => ({
  owner: one(users, {
    fields: [accountabilityLinks.ownerId],
    references: [users.id]
  }),
  partner: one(users, {
    fields: [accountabilityLinks.accountabilityPartnerId],
    references: [users.id]
  }),
  comments: many(accountabilityComments),
  alerts: many(accountabilityAlerts)
}));

export const accountabilityCommentsRelations = relations(accountabilityComments, ({ one }) => ({
  link: one(accountabilityLinks, {
    fields: [accountabilityComments.linkId],
    references: [accountabilityLinks.id]
  }),
  commenter: one(users, {
    fields: [accountabilityComments.commenterId],
    references: [users.id]
  })
}));

export const accountabilityAlertsRelations = relations(accountabilityAlerts, ({ one }) => ({
  link: one(accountabilityLinks, {
    fields: [accountabilityAlerts.linkId],
    references: [accountabilityLinks.id]
  })
}));

export const inviteTokensRelations = relations(inviteTokens, ({ one }) => ({
  owner: one(users, {
    fields: [inviteTokens.ownerId],
    references: [users.id]
  })
}));

export const cashAccountsRelations = relations(cashAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [cashAccounts.userId],
    references: [users.id]
  }),
  transactions: many(transactions)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  account: one(cashAccounts, {
    fields: [transactions.accountId],
    references: [cashAccounts.id]
  })
}));

export const savingsGoalsRelations = relations(savingsGoals, ({ one }) => ({
  user: one(users, {
    fields: [savingsGoals.userId],
    references: [users.id]
  })
}));

export const capTableEntriesRelations = relations(capTableEntries, ({ one }) => ({
  company: one(companies, {
    fields: [capTableEntries.companyId],
    references: [companies.id]
  })
}));

export const companyProductsRelations = relations(companyProducts, ({ one }) => ({
  company: one(companies, {
    fields: [companyProducts.companyId],
    references: [companies.id]
  })
}));
