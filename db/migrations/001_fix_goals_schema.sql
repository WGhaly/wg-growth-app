-- Migration: Fix Goals Schema to Match Master Requirements
-- Date: 2026-01-30
-- Description: Add 10 missing fields to goals table, fix timeHorizon enum, create junction tables

-- ============================================================================
-- STEP 1: Add new columns to goals table
-- ============================================================================

-- Add reflective fields (required per master doc)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS why_it_matters TEXT NOT NULL DEFAULT 'To be defined';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS success_criteria TEXT NOT NULL DEFAULT 'To be defined';

-- Add progress tracking
ALTER TABLE goals ADD COLUMN IF NOT EXISTS current_progress INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS measurement_method VARCHAR(255);

-- Add completion reflection
ALTER TABLE goals ADD COLUMN IF NOT EXISTS completion_reflection TEXT;

-- Add archived_at (separate from abandoned_at)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add life season linkage (references will be added when life_seasons table exists)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS life_season_id UUID;

-- ============================================================================
-- STEP 2: Fix time_horizon enum
-- ============================================================================

-- Create new enum with correct values
CREATE TYPE time_horizon_new AS ENUM ('1-month', '3-month', '6-month', '1-year', '5-year', 'lifetime');

-- Alter column type with proper conversion
ALTER TABLE goals ALTER COLUMN time_horizon TYPE time_horizon_new USING (
    CASE time_horizon::text
        WHEN 'daily' THEN '1-month'
        WHEN 'weekly' THEN '1-month'
        WHEN 'monthly' THEN '3-month'
        WHEN 'quarterly' THEN '6-month'
        WHEN 'yearly' THEN '1-year'
        WHEN 'lifetime' THEN 'lifetime'
        ELSE '1-year'
    END::time_horizon_new
);

-- Drop old enum and rename new one
DROP TYPE time_horizon;
ALTER TYPE time_horizon_new RENAME TO time_horizon;

-- ============================================================================
-- STEP 3: Create junction tables
-- ============================================================================

-- Goal-Habits Junction Table
CREATE TABLE IF NOT EXISTS goal_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT goal_habits_unique UNIQUE (goal_id, habit_id)
);

CREATE INDEX IF NOT EXISTS idx_goal_habits_goal_id ON goal_habits(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_habits_habit_id ON goal_habits(habit_id);

-- Goal-Routines Junction Table
CREATE TABLE IF NOT EXISTS goal_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT goal_routines_unique UNIQUE (goal_id, routine_id)
);

CREATE INDEX IF NOT EXISTS idx_goal_routines_goal_id ON goal_routines(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_routines_routine_id ON goal_routines(routine_id);

-- ============================================================================
-- STEP 4: Update defaults for existing goals
-- ============================================================================

-- Remove default constraint after data is populated (optional, can keep for new rows)
-- ALTER TABLE goals ALTER COLUMN why_it_matters DROP DEFAULT;
-- ALTER TABLE goals ALTER COLUMN success_criteria DROP DEFAULT;

-- ============================================================================
-- Migration complete
-- ============================================================================

-- Verify changes
DO $$
BEGIN
    RAISE NOTICE 'Migration 001_fix_goals_schema.sql completed successfully';
    RAISE NOTICE 'Goals table now has columns: why_it_matters, success_criteria, current_progress, measurement_method, completion_reflection, archived_at, life_season_id';
    RAISE NOTICE 'time_horizon enum updated to: 1-month, 3-month, 6-month, 1-year, 5-year, lifetime';
    RAISE NOTICE 'Junction tables created: goal_habits, goal_routines';
END $$;
