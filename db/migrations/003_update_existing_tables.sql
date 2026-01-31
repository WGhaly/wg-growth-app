-- Migration: Update Existing Tables with Missing Fields
-- Date: 2026-01-30
-- Description: Add missing fields to habits, people, profiles, manifestos, routine_items, companies

-- ============================================================================
-- PART 1: Habits - Bad Habit Spiritual Tracking
-- ============================================================================

ALTER TABLE habits ADD COLUMN IF NOT EXISTS trigger_description TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS emotional_cost TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS spiritual_cost TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS replacement_habit VARCHAR(255);
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reduction_target VARCHAR(100);

-- ============================================================================
-- PART 2: People - Relationship Evaluation Fields
-- ============================================================================

ALTER TABLE people ADD COLUMN IF NOT EXISTS how_we_met TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS why_i_value_them TEXT;
ALTER TABLE people ADD COLUMN IF NOT EXISTS decision_direction VARCHAR(50);

-- Fix relationship_circle enum to include friends and partners
DO $$ 
BEGIN
    -- Check if we need to update the enum
    IF EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'inner' AND enumtypid = 'relationship_circle'::regtype) 
       AND NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'friends' AND enumtypid = 'relationship_circle'::regtype) THEN
        
        -- Create new enum with all values
        CREATE TYPE relationship_circle_new AS ENUM ('inner', 'friends', 'partners', 'prayer', 'outer', 'distant');
        
        -- Update column type
        ALTER TABLE people ALTER COLUMN relationship_circle TYPE relationship_circle_new 
            USING relationship_circle::text::relationship_circle_new;
        
        -- Drop old enum and rename
        DROP TYPE relationship_circle;
        ALTER TYPE relationship_circle_new RENAME TO relationship_circle;
    END IF;
END $$;

-- ============================================================================
-- PART 3: Profiles - Reflection Preference & Faith
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faith VARCHAR(50) DEFAULT 'christian_biblical' NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reflection_depth_preference VARCHAR(50) DEFAULT 'moderate';

-- ============================================================================
-- PART 4: Manifestos - Restructure to Identity Statements
-- ============================================================================

-- Rename table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manifestos') THEN
        ALTER TABLE manifestos RENAME TO identity_statements;
        
        -- Rename content column
        ALTER TABLE identity_statements RENAME COLUMN content TO personal_manifesto;
        
        -- Add new columns
        ALTER TABLE identity_statements ADD COLUMN IF NOT EXISTS man_i_am_becoming TEXT;
        ALTER TABLE identity_statements ADD COLUMN IF NOT EXISTS calling_statement TEXT;
        
        -- Update index name
        DROP INDEX IF EXISTS idx_manifestos_user_id;
        CREATE INDEX IF NOT EXISTS idx_identity_statements_user_id ON identity_statements(user_id);
    END IF;
END $$;

-- ============================================================================
-- PART 5: Routine Items - Minimum/Ideal Flags
-- ============================================================================

ALTER TABLE routine_items ADD COLUMN IF NOT EXISTS is_minimum_standard BOOLEAN DEFAULT TRUE;
ALTER TABLE routine_items ADD COLUMN IF NOT EXISTS is_ideal_only BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- PART 6: Companies - Industry & AP/Liabilities
-- ============================================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS accounts_payable_liabilities DECIMAL(15,2) DEFAULT 0;

-- ============================================================================
-- PART 7: Ex Relationships - Closure & Forgiveness Status
-- ============================================================================

-- Check if ex_relationships table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ex_relationships') THEN
        ALTER TABLE ex_relationships ADD COLUMN IF NOT EXISTS closure_status VARCHAR(100);
        ALTER TABLE ex_relationships ADD COLUMN IF NOT EXISTS forgiveness_status TEXT;
    ELSE
        RAISE NOTICE 'Table ex_relationships does not exist, skipping...';
    END IF;
END $$;

-- ============================================================================
-- Migration complete
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 003_update_existing_tables.sql completed successfully';
    RAISE NOTICE 'Updated tables:';
    RAISE NOTICE '  - habits: Added 5 bad habit tracking fields (trigger, emotional_cost, spiritual_cost, replacement, reduction_target)';
    RAISE NOTICE '  - people: Added 3 evaluation fields (how_we_met, why_i_value_them, decision_direction) + fixed enum';
    RAISE NOTICE '  - profiles: Added faith and reflection_depth_preference';
    RAISE NOTICE '  - manifestos → identity_statements: Restructured with 3 separate fields';
    RAISE NOTICE '  - routine_items: Added is_minimum_standard and is_ideal_only flags';
    RAISE NOTICE '  - companies: Added industry and accounts_payable_liabilities';
    RAISE NOTICE '  - ex_relationships: Added closure_status and forgiveness_status (if table exists)';
END $$;
