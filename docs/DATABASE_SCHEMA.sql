-- ============================================================================
-- WG LIFE OS - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- PostgreSQL 15+
-- Owner: Waseem Ghaly
-- Date: January 29, 2026
-- 
-- This schema defines ALL tables, relationships, indexes, and constraints
-- for the WG Life OS application. No abstraction or simplification.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For exclusion constraints

-- ============================================================================
-- ENUMS (Type Safety)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'point_of_light', 'secondary_user');
CREATE TYPE goal_category AS ENUM ('faith', 'character', 'health', 'finance', 'business', 'relationships');
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
CREATE TYPE time_horizon AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime');
CREATE TYPE routine_type AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE routine_completion_level AS ENUM ('none', 'minimum', 'ideal');
CREATE TYPE habit_type AS ENUM ('good', 'bad');
CREATE TYPE habit_measurement AS ENUM ('binary', 'count', 'duration', 'scale');
CREATE TYPE relationship_type AS ENUM ('friend', 'family', 'partner', 'potential_partner', 'business_partner', 'ex', 'mentor', 'accountability');
CREATE TYPE relationship_circle AS ENUM ('inner', 'middle', 'outer', 'distant');
CREATE TYPE trust_level AS ENUM ('high', 'medium', 'low', 'none');
CREATE TYPE emotional_impact AS ENUM ('very_positive', 'positive', 'neutral', 'negative', 'very_negative');
CREATE TYPE prayer_frequency AS ENUM ('daily', 'weekly', 'monthly', 'as_needed');
CREATE TYPE prayer_status AS ENUM ('praying', 'answered', 'no_longer_relevant');
CREATE TYPE investment_type AS ENUM ('stocks', 'bonds', 'crypto', 'real_estate', 'business', 'other');
CREATE TYPE company_status AS ENUM ('active', 'paused', 'sold', 'closed');
CREATE TYPE insight_category AS ENUM ('behavioral', 'financial', 'relationship', 'faith', 'health');
CREATE TYPE insight_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE notification_type AS ENUM ('routine_reminder', 'reflection_prompt', 'insight_alert', 'accountability_alert', 'birthday', 'goal_milestone');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');
CREATE TYPE permission_scope AS ENUM ('profile', 'identity', 'goals', 'routines', 'habits', 'habits_good', 'habits_bad', 'relationships', 'prayer', 'finance', 'business', 'insights');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users & Authentication
-- ----------------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'owner' NOT NULL,
    
    -- WebAuthn / Passkeys
    webauthn_credentials JSONB DEFAULT '[]'::jsonb, -- Array of credential objects
    webauthn_challenge VARCHAR(255), -- Current challenge for verification
    biometric_enabled BOOLEAN DEFAULT FALSE,
    
    -- Session Management
    last_activity TIMESTAMPTZ,
    last_biometric_verification TIMESTAMPTZ,
    session_expires_at TIMESTAMPTZ,
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(id) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_users_session ON users(id, session_expires_at) WHERE session_expires_at > NOW();

-- ----------------------------------------------------------------------------
-- User Profiles & Life Seasons
-- ----------------------------------------------------------------------------

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    
    -- Life Season
    current_year_theme VARCHAR(255), -- e.g., "Year of Discipline"
    current_season_description TEXT,
    current_age_calculated INTEGER GENERATED ALWAYS AS (
        EXTRACT(YEAR FROM AGE(date_of_birth))
    ) STORED,
    
    -- Display Preferences
    profile_photo_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_birthday ON profiles(date_of_birth); -- For birthday notifications

-- ----------------------------------------------------------------------------
-- Identity & Faith
-- ----------------------------------------------------------------------------

CREATE TABLE identity_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identity Core
    personal_manifesto TEXT, -- Who I am
    man_i_am_becoming TEXT, -- Who I'm becoming
    calling_statement TEXT, -- What I'm called to do
    
    -- Version Control (user can update over time)
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    replaced_by UUID REFERENCES identity_statements(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure only one current version per user
    CONSTRAINT unique_current_identity UNIQUE (user_id, is_current)
);

CREATE INDEX idx_identity_user ON identity_statements(user_id);
CREATE INDEX idx_identity_current ON identity_statements(user_id, is_current) WHERE is_current = TRUE;

CREATE TABLE core_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    value_name VARCHAR(100) NOT NULL, -- e.g., "Integrity", "Excellence"
    definition TEXT, -- Personal definition
    why_it_matters TEXT, -- Why this value is core
    
    display_order INTEGER, -- User can reorder
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, value_name)
);

CREATE INDEX idx_core_values_user ON core_values(user_id, display_order);

CREATE TABLE faith_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    reflection_date DATE NOT NULL,
    
    -- Biblical Reflection
    scripture_reference VARCHAR(255), -- e.g., "Proverbs 27:17"
    scripture_text TEXT,
    personal_reflection TEXT,
    
    -- Faith Questions (prompts)
    how_did_i_see_god_today TEXT,
    where_did_i_resist_god TEXT,
    what_am_i_grateful_for TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_faith_user_date ON faith_reflections(user_id, reflection_date DESC);

-- ----------------------------------------------------------------------------
-- Life Seasons (Major Life Phases)
-- ----------------------------------------------------------------------------

CREATE TABLE life_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    season_name VARCHAR(255) NOT NULL, -- e.g., "Medical School Years", "Rebuilding Phase"
    description TEXT,
    
    start_date DATE NOT NULL,
    end_date DATE, -- NULL if current season
    
    -- Key learnings from this season
    key_learnings TEXT,
    defining_moments TEXT,
    
    is_current BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Only one current season per user
    CONSTRAINT unique_current_season EXCLUDE USING gist (
        user_id WITH =,
        is_current WITH =
    ) WHERE (is_current = TRUE)
);

CREATE INDEX idx_life_seasons_user ON life_seasons(user_id, start_date DESC);
CREATE INDEX idx_life_seasons_current ON life_seasons(user_id) WHERE is_current = TRUE;

-- ============================================================================
-- GOALS, ROUTINES, HABITS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Goals
-- ----------------------------------------------------------------------------

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Goal Definition
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category goal_category NOT NULL,
    status goal_status DEFAULT 'not_started' NOT NULL,
    
    -- Time Boundaries
    time_horizon time_horizon NOT NULL,
    target_date DATE,
    
    -- Measurable Outcome
    success_criteria TEXT, -- What does done look like?
    measurement_method VARCHAR(255), -- How to measure
    current_progress INTEGER DEFAULT 0, -- 0-100 percentage
    
    -- Motivation
    why_this_matters TEXT,
    
    -- Linked Season
    life_season_id UUID REFERENCES life_seasons(id) ON DELETE SET NULL,
    
    -- Completion
    completed_at TIMESTAMPTZ,
    completion_reflection TEXT, -- What I learned
    
    -- Archival
    archived_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_goals_user_status ON goals(user_id, status) WHERE archived_at IS NULL;
CREATE INDEX idx_goals_user_category ON goals(user_id, category) WHERE archived_at IS NULL;
CREATE INDEX idx_goals_user_horizon ON goals(user_id, time_horizon) WHERE archived_at IS NULL;
CREATE INDEX idx_goals_target_date ON goals(target_date) WHERE status != 'completed' AND archived_at IS NULL;

-- ----------------------------------------------------------------------------
-- Routines (Daily, Weekly, Monthly Structure)
-- ----------------------------------------------------------------------------

CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    routine_name VARCHAR(255) NOT NULL,
    routine_type routine_type NOT NULL,
    description TEXT,
    
    -- Scheduling
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE, -- NULL for indefinite
    
    -- For weekly routines: which days?
    scheduled_days INTEGER[], -- 0=Sunday, 6=Saturday
    
    -- For monthly routines: which day of month?
    scheduled_day_of_month INTEGER, -- 1-31
    
    -- Ideal vs Minimum
    ideal_time TIME, -- Target time to do it
    minimum_duration_minutes INTEGER, -- Minimum to count as done
    ideal_duration_minutes INTEGER, -- Ideal duration
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived_at TIMESTAMPTZ
);

CREATE INDEX idx_routines_user_type ON routines(user_id, routine_type) WHERE archived_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_routines_active ON routines(user_id) WHERE is_active = TRUE AND archived_at IS NULL;

-- Routine Items (Sub-tasks within a routine)
CREATE TABLE routine_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_optional BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_routine_items_routine ON routine_items(routine_id, display_order);

-- Routine Logs (Completion tracking)
CREATE TABLE routine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    log_time TIME DEFAULT CURRENT_TIME,
    
    completion_level routine_completion_level NOT NULL,
    duration_minutes INTEGER,
    
    -- Which items were completed?
    completed_items UUID[], -- Array of routine_item IDs
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(routine_id, log_date) -- One log per routine per day
);

CREATE INDEX idx_routine_logs_user_date ON routine_logs(user_id, log_date DESC);
CREATE INDEX idx_routine_logs_routine ON routine_logs(routine_id, log_date DESC);
CREATE INDEX idx_routine_logs_completion ON routine_logs(user_id, completion_level, log_date DESC);

-- ----------------------------------------------------------------------------
-- Habits (Good & Bad)
-- ----------------------------------------------------------------------------

CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    habit_name VARCHAR(255) NOT NULL,
    habit_type habit_type NOT NULL,
    measurement_type habit_measurement NOT NULL,
    
    description TEXT,
    
    -- For good habits
    target_frequency VARCHAR(100), -- e.g., "3x per week", "daily"
    target_value DECIMAL(10,2), -- For count/duration/scale
    
    -- For bad habits
    trigger_description TEXT, -- What triggers this habit?
    emotional_cost TEXT, -- How does this hurt me?
    spiritual_cost TEXT, -- How does this distance me from God?
    replacement_habit VARCHAR(255), -- What to do instead?
    reduction_target VARCHAR(100), -- e.g., "reduce by 50% in 30 days"
    
    -- Linked to goals
    linked_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived_at TIMESTAMPTZ
);

CREATE INDEX idx_habits_user_type ON habits(user_id, habit_type) WHERE archived_at IS NULL;
CREATE INDEX idx_habits_user_active ON habits(user_id) WHERE is_active = TRUE AND archived_at IS NULL;
CREATE INDEX idx_habits_goal ON habits(linked_goal_id) WHERE linked_goal_id IS NOT NULL;

-- Habit Logs
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    log_time TIME DEFAULT CURRENT_TIME,
    
    -- Measurement
    completed BOOLEAN, -- For binary
    count_value INTEGER, -- For count
    duration_minutes INTEGER, -- For duration
    scale_value DECIMAL(3,1), -- For scale (e.g., 1-10)
    
    -- Context
    location VARCHAR(255),
    emotional_state VARCHAR(100),
    trigger_identified VARCHAR(255), -- For bad habits
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, log_date DESC);
CREATE INDEX idx_habit_logs_habit ON habit_logs(habit_id, log_date DESC);
CREATE INDEX idx_habit_logs_user_habit_date ON habit_logs(user_id, habit_id, log_date DESC);

-- ============================================================================
-- RELATIONSHIPS & PEOPLE
-- ============================================================================

CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    nickname VARCHAR(100),
    
    -- Relationship
    relationship_type relationship_type NOT NULL,
    relationship_circle relationship_circle DEFAULT 'middle',
    trust_level trust_level DEFAULT 'medium',
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- Emotional Dynamics
    emotional_impact emotional_impact DEFAULT 'neutral',
    how_they_make_me_feel TEXT,
    what_i_bring_to_them TEXT,
    
    -- Boundaries & Notes
    boundaries_needed TEXT,
    red_flags TEXT,
    green_flags TEXT,
    
    -- Dates
    date_met DATE,
    birthday DATE,
    last_contact_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_people_user ON people(user_id, relationship_type);
CREATE INDEX idx_people_circle ON people(user_id, relationship_circle) WHERE is_active = TRUE;
CREATE INDEX idx_people_birthday ON people(birthday) WHERE birthday IS NOT NULL;

-- Relationship Notes & Interactions
CREATE TABLE relationship_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    
    note_date DATE DEFAULT CURRENT_DATE,
    note_type VARCHAR(50), -- e.g., "interaction", "observation", "conflict", "growth"
    
    title VARCHAR(255),
    content TEXT NOT NULL,
    
    -- Sentiment tracking
    my_emotional_state VARCHAR(100),
    their_emotional_state VARCHAR(100),
    
    -- Tags
    tags VARCHAR(50)[],
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_relationship_notes_person ON relationship_notes(person_id, note_date DESC);
CREATE INDEX idx_relationship_notes_user_date ON relationship_notes(user_id, note_date DESC);

-- Exes (Special Category for Healing & Learning)
CREATE TABLE ex_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    
    relationship_duration_months INTEGER,
    ended_date DATE,
    
    -- Reflection
    why_it_ended TEXT,
    how_i_was_hurt TEXT,
    how_i_hurt_them TEXT,
    lessons_learned TEXT,
    patterns_i_see TEXT,
    
    -- Current Impact
    current_life_impact TEXT, -- How this still affects me
    healing_progress TEXT,
    forgiveness_status TEXT, -- Have I forgiven? Have I been forgiven?
    
    -- Boundaries
    still_in_contact BOOLEAN DEFAULT FALSE,
    boundaries_needed TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, person_id)
);

CREATE INDEX idx_ex_relationships_user ON ex_relationships(user_id);

-- ============================================================================
-- PRAYER SYSTEM
-- ============================================================================

CREATE TABLE prayer_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL, -- Can be for a person
    
    -- Prayer Request
    request_title VARCHAR(255) NOT NULL,
    request_details TEXT,
    
    -- Status & Frequency
    prayer_status prayer_status DEFAULT 'praying' NOT NULL,
    prayer_frequency prayer_frequency DEFAULT 'as_needed',
    
    -- Dates
    started_praying_date DATE DEFAULT CURRENT_DATE,
    last_prayed_date DATE,
    answered_date DATE,
    
    -- Answer & Reflection
    how_it_was_answered TEXT,
    what_i_learned TEXT,
    
    -- Reminder
    reminder_enabled BOOLEAN DEFAULT FALSE,
    reminder_time TIME,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived_at TIMESTAMPTZ
);

CREATE INDEX idx_prayer_user_status ON prayer_entries(user_id, prayer_status) WHERE archived_at IS NULL;
CREATE INDEX idx_prayer_person ON prayer_entries(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX idx_prayer_frequency ON prayer_entries(user_id, prayer_frequency, last_prayed_date);

-- Prayer Logs (Track when you prayed)
CREATE TABLE prayer_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_entry_id UUID NOT NULL REFERENCES prayer_entries(id) ON DELETE CASCADE,
    
    prayed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_prayer_logs_entry ON prayer_logs(prayer_entry_id, prayed_at DESC);
CREATE INDEX idx_prayer_logs_user ON prayer_logs(user_id, prayed_at DESC);

-- ============================================================================
-- FINANCE & WEALTH
-- ============================================================================

-- Personal Finance Overview
CREATE TABLE finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Current State (manually updated)
    total_cash DECIMAL(15,2) DEFAULT 0,
    monthly_income DECIMAL(15,2) DEFAULT 0,
    monthly_expenses DECIMAL(15,2) DEFAULT 0,
    
    -- Goals
    emergency_fund_target DECIMAL(15,2),
    emergency_fund_current DECIMAL(15,2) DEFAULT 0,
    
    -- Net Worth Snapshot (updated monthly)
    last_net_worth DECIMAL(15,2),
    last_net_worth_date DATE,
    
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Cash Flow Entries (Income & Expenses)
CREATE TABLE cash_flow_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    entry_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g., "salary", "rent", "groceries"
    subcategory VARCHAR(100),
    
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    
    description TEXT,
    
    -- Tracking
    is_recurring BOOLEAN DEFAULT FALSE,
    tags VARCHAR(50)[],
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cash_flow_user_date ON cash_flow_entries(user_id, entry_date DESC);
CREATE INDEX idx_cash_flow_type ON cash_flow_entries(user_id, type, entry_date DESC);
CREATE INDEX idx_cash_flow_category ON cash_flow_entries(user_id, category, entry_date DESC);

-- Investments (Manual Entry)
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    investment_name VARCHAR(255) NOT NULL,
    investment_type investment_type NOT NULL,
    
    -- Amounts
    initial_investment DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    
    -- Dates
    purchase_date DATE NOT NULL,
    last_updated_date DATE DEFAULT CURRENT_DATE,
    
    -- Details
    description TEXT,
    platform_or_broker VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    sold_date DATE,
    sold_price DECIMAL(15,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_investments_user ON investments(user_id, is_active);
CREATE INDEX idx_investments_type ON investments(user_id, investment_type);

-- ============================================================================
-- BUSINESS & EQUITY
-- ============================================================================

-- Companies (Businesses I own or have equity in)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    description TEXT,
    
    -- Status
    status company_status DEFAULT 'active' NOT NULL,
    founded_date DATE,
    closed_date DATE,
    
    -- Ownership
    my_ownership_percentage DECIMAL(5,2) NOT NULL, -- e.g., 25.50
    total_shares_outstanding BIGINT,
    my_shares BIGINT,
    
    -- Valuation
    current_valuation DECIMAL(15,2),
    last_valuation_date DATE,
    my_equity_value DECIMAL(15,2) GENERATED ALWAYS AS (
        current_valuation * my_ownership_percentage / 100
    ) STORED,
    
    -- Investment
    cash_invested DECIMAL(15,2) DEFAULT 0,
    sweat_equity_hours INTEGER DEFAULT 0,
    
    -- Notes
    business_model TEXT,
    key_metrics TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_companies_user ON companies(user_id, status);
CREATE INDEX idx_companies_active ON companies(user_id) WHERE status = 'active';

-- Products within Companies
CREATE TABLE company_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Equity in this specific product (if different from company)
    has_separate_equity BOOLEAN DEFAULT FALSE,
    my_product_ownership_percentage DECIMAL(5,2),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    launched_date DATE,
    sunset_date DATE,
    
    -- Metrics
    revenue_share_percentage DECIMAL(5,2), -- If profit-sharing
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_company_products_company ON company_products(company_id);

-- Cap Table Entries (Who else owns what?)
CREATE TABLE cap_table_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    shareholder_name VARCHAR(255) NOT NULL,
    shareholder_type VARCHAR(100), -- e.g., "founder", "investor", "employee"
    
    ownership_percentage DECIMAL(5,2) NOT NULL,
    shares BIGINT,
    
    investment_amount DECIMAL(15,2),
    investment_date DATE,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cap_table_company ON cap_table_entries(company_id);

-- ============================================================================
-- ACCOUNTABILITY & PERMISSIONS
-- ============================================================================

-- Accountability Links (Point of Light relationships)
CREATE TABLE accountability_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Owner and Accountability Partner
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    point_of_light_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Permissions
    granted_scopes permission_scope[] NOT NULL,
    can_comment BOOLEAN DEFAULT TRUE,
    receive_alerts BOOLEAN DEFAULT TRUE,
    
    -- Invitation
    invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id), -- Who revoked it?
    
    -- Metadata
    invitation_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CHECK (owner_id != point_of_light_id), -- Can't be your own accountability partner
    UNIQUE(owner_id, point_of_light_id, revoked_at) -- One active link per pair
);

CREATE INDEX idx_accountability_owner ON accountability_links(owner_id, is_active);
CREATE INDEX idx_accountability_pol ON accountability_links(point_of_light_id, is_active);
CREATE INDEX idx_accountability_active ON accountability_links(owner_id, point_of_light_id) 
    WHERE is_active = TRUE AND revoked_at IS NULL;

-- Comments from Accountability Partners
CREATE TABLE accountability_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES accountability_links(id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- What they're commenting on
    scope permission_scope NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., "goal", "habit", "routine", "insight"
    entity_id UUID NOT NULL, -- ID of the thing they're commenting on
    
    comment_text TEXT NOT NULL,
    is_prayer BOOLEAN DEFAULT FALSE, -- Is this a prayer note?
    
    -- Acknowledgment
    read_at TIMESTAMPTZ,
    responded_to BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_accountability_comments_link ON accountability_comments(link_id, created_at DESC);
CREATE INDEX idx_accountability_comments_entity ON accountability_comments(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_accountability_comments_unread ON accountability_comments(link_id) WHERE read_at IS NULL;

-- ============================================================================
-- INSIGHTS ENGINE
-- ============================================================================

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Classification
    category insight_category NOT NULL,
    severity insight_severity DEFAULT 'info' NOT NULL,
    
    -- Detection
    detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    pattern_name VARCHAR(255) NOT NULL, -- e.g., "discipline_decay", "avoidance_pattern"
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    suggested_action TEXT,
    
    -- Evidence (links to data)
    evidence_type VARCHAR(50), -- e.g., "habit_logs", "routine_logs"
    evidence_ids UUID[], -- IDs of related records
    
    -- Metrics
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    impact_score INTEGER, -- 1-10
    
    -- User Interaction
    acknowledged_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    action_taken BOOLEAN DEFAULT FALSE,
    action_notes TEXT,
    
    -- Recurrence (if this insight appears again)
    is_recurring BOOLEAN DEFAULT FALSE,
    first_detected_at TIMESTAMPTZ,
    recurrence_count INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_insights_user ON insights(user_id, detected_at DESC);
CREATE INDEX idx_insights_category ON insights(user_id, category, detected_at DESC);
CREATE INDEX idx_insights_severity ON insights(user_id, severity) WHERE acknowledged_at IS NULL;
CREATE INDEX idx_insights_unacknowledged ON insights(user_id) WHERE acknowledged_at IS NULL;

-- Insight Rules Configuration (for edge functions)
CREATE TABLE insight_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    rule_name VARCHAR(255) UNIQUE NOT NULL,
    category insight_category NOT NULL,
    
    -- Detection Logic (stored as JSON for flexibility)
    detection_config JSONB NOT NULL,
    -- Example: {"lookback_days": 30, "threshold": 0.7, "min_occurrences": 5}
    
    -- Severity Thresholds
    info_threshold DECIMAL(5,2),
    warning_threshold DECIMAL(5,2),
    critical_threshold DECIMAL(5,2),
    
    -- Messaging
    title_template VARCHAR(255),
    description_template TEXT,
    suggested_action_template TEXT,
    
    is_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_insight_rules_enabled ON insight_rules(category) WHERE is_enabled = TRUE;

-- ============================================================================
-- NOTIFICATIONS & PUSH
-- ============================================================================

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Push Subscription Object (from Web Push API)
    endpoint VARCHAR(500) UNIQUE NOT NULL,
    keys_p256dh VARCHAR(255) NOT NULL,
    keys_auth VARCHAR(255) NOT NULL,
    
    -- Device Info
    device_name VARCHAR(255),
    user_agent TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type & Content
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    
    -- Action (optional click action)
    action_url VARCHAR(500),
    
    -- Related Entity
    related_entity_type VARCHAR(50), -- e.g., "routine", "goal", "insight"
    related_entity_id UUID,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sent_at TIMESTAMPTZ,
    
    -- Delivery Status
    status notification_status DEFAULT 'pending' NOT NULL,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- User Interaction
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ============================================================================
-- AUDIT & LOGGING
-- ============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- What
    action VARCHAR(100) NOT NULL, -- e.g., "goal.created", "routine.completed"
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- When
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at DESC);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_identity_statements_updated_at BEFORE UPDATE ON identity_statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_values_updated_at BEFORE UPDATE ON core_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faith_reflections_updated_at BEFORE UPDATE ON faith_reflections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_life_seasons_updated_at BEFORE UPDATE ON life_seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routine_items_updated_at BEFORE UPDATE ON routine_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relationship_notes_updated_at BEFORE UPDATE ON relationship_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ex_relationships_updated_at BEFORE UPDATE ON ex_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_entries_updated_at BEFORE UPDATE ON prayer_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finances_updated_at BEFORE UPDATE ON finances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_flow_entries_updated_at BEFORE UPDATE ON cash_flow_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_products_updated_at BEFORE UPDATE ON company_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cap_table_entries_updated_at BEFORE UPDATE ON cap_table_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accountability_links_updated_at BEFORE UPDATE ON accountability_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accountability_comments_updated_at BEFORE UPDATE ON accountability_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insight_rules_updated_at BEFORE UPDATE ON insight_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Initial insight rules)
-- ============================================================================

INSERT INTO insight_rules (rule_name, category, detection_config, warning_threshold, critical_threshold, title_template, description_template, suggested_action_template) VALUES

('discipline_decay', 'behavioral', 
 '{"lookback_days": 30, "completion_rate_threshold": 0.7, "consecutive_misses": 3}'::jsonb,
 0.60, 0.40,
 'Discipline Decay Detected',
 'Your routine completion rate has dropped to {completion_rate}% over the past {lookback_days} days.',
 'Review your routines and identify what''s causing the slip. Simplify if needed.'),

('avoidance_pattern', 'behavioral',
 '{"lookback_days": 14, "specific_routine_misses": 5, "high_value_routine": true}'::jsonb,
 0.50, 0.30,
 'Avoidance Pattern: {routine_name}',
 'You''ve skipped "{routine_name}" {miss_count} times in {lookback_days} days. This routine is marked high-value.',
 'Ask yourself: What am I avoiding? What fear or discomfort is underneath this?'),

('stress_spending', 'financial',
 '{"lookback_days": 30, "expense_variance_threshold": 1.5, "category": "discretionary"}'::jsonb,
 1.40, 1.80,
 'Spending Spike Detected',
 'Your discretionary spending is {variance}x higher than your 90-day average.',
 'Review recent expenses. Is stress driving this? What''s the underlying need?'),

('relationship_drain', 'relationship',
 '{"lookback_days": 60, "negative_note_count": 3, "positive_note_count": 0}'::jsonb,
 2, 3,
 'Relationship Red Flag: {person_name}',
 'You''ve logged {negative_count} negative interactions with {person_name} and zero positive ones in {lookback_days} days.',
 'Evaluate this relationship. Is it time to set boundaries or create distance?'),

('prayer_drift', 'faith',
 '{"lookback_days": 14, "expected_frequency": "daily", "actual_count": 3}'::jsonb,
 0.50, 0.30,
 'Prayer Consistency Drop',
 'You''ve prayed {actual_count} times in the past {lookback_days} days (target: daily).',
 'What''s pulling you away from prayer? Set a specific time and place to rebuild this habit.'),

('bad_habit_escalation', 'behavioral',
 '{"lookback_days": 14, "frequency_increase": 2.0, "habit_type": "bad"}'::jsonb,
 1.50, 2.00,
 'Bad Habit Escalating: {habit_name}',
 'The frequency of "{habit_name}" has doubled in the past {lookback_days} days.',
 'Identify the trigger. Implement the replacement habit. Consider accountability.'),

('goal_stagnation', 'behavioral',
 '{"lookback_days": 30, "progress_change": 0, "goal_status": "in_progress"}'::jsonb,
 15, 30,
 'Goal Stagnation: {goal_title}',
 'No progress on "{goal_title}" in {lookback_days} days.',
 'Break this goal into smaller milestones. Or honestly assess if it''s still relevant.');

-- ============================================================================
-- VIEWS (Helpful aggregations)
-- ============================================================================

-- User Dashboard Statistics
CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id AS user_id,
    
    -- Routines (last 30 days)
    COUNT(DISTINCT rl.id) FILTER (WHERE rl.log_date > CURRENT_DATE - INTERVAL '30 days') AS routines_completed_30d,
    ROUND(AVG(CASE 
        WHEN rl.completion_level = 'ideal' THEN 100
        WHEN rl.completion_level = 'minimum' THEN 60
        ELSE 0 
    END) FILTER (WHERE rl.log_date > CURRENT_DATE - INTERVAL '30 days'), 1) AS avg_routine_completion_rate,
    
    -- Habits (last 30 days)
    COUNT(DISTINCT hl.id) FILTER (WHERE hl.log_date > CURRENT_DATE - INTERVAL '30 days') AS habit_logs_30d,
    COUNT(DISTINCT h.id) FILTER (WHERE h.habit_type = 'good' AND h.is_active) AS active_good_habits,
    COUNT(DISTINCT h.id) FILTER (WHERE h.habit_type = 'bad' AND h.is_active) AS active_bad_habits,
    
    -- Goals
    COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'in_progress') AS active_goals,
    COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'completed' AND g.completed_at > CURRENT_DATE - INTERVAL '30 days') AS goals_completed_30d,
    
    -- Prayer
    COUNT(DISTINCT pe.id) FILTER (WHERE pe.prayer_status = 'praying') AS active_prayers,
    COUNT(DISTINCT pl.id) FILTER (WHERE pl.prayed_at > NOW() - INTERVAL '7 days') AS prayers_7d,
    
    -- Insights
    COUNT(DISTINCT i.id) FILTER (WHERE i.acknowledged_at IS NULL AND i.severity IN ('warning', 'critical')) AS unacknowledged_insights,
    
    -- Relationships
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_active AND p.relationship_circle = 'inner') AS inner_circle_count

FROM users u
LEFT JOIN routine_logs rl ON rl.user_id = u.id
LEFT JOIN habit_logs hl ON hl.user_id = u.id
LEFT JOIN habits h ON h.user_id = u.id
LEFT JOIN goals g ON g.user_id = u.id AND g.archived_at IS NULL
LEFT JOIN prayer_entries pe ON pe.user_id = u.id AND pe.archived_at IS NULL
LEFT JOIN prayer_logs pl ON pl.user_id = u.id
LEFT JOIN insights i ON i.user_id = u.id
LEFT JOIN people p ON p.user_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY u.id;

-- Goal Progress View
CREATE VIEW goal_progress AS
SELECT 
    g.id AS goal_id,
    g.user_id,
    g.title,
    g.category,
    g.time_horizon,
    g.current_progress,
    g.target_date,
    
    -- Days remaining
    CASE 
        WHEN g.target_date IS NOT NULL THEN g.target_date - CURRENT_DATE
        ELSE NULL 
    END AS days_remaining,
    
    -- Linked habits completion rate
    ROUND(AVG(CASE 
        WHEN hl.completed = TRUE THEN 100
        ELSE 0 
    END), 1) AS linked_habits_completion_rate,
    
    -- Last activity
    MAX(GREATEST(g.updated_at, COALESCE(hl.created_at, g.updated_at))) AS last_activity

FROM goals g
LEFT JOIN habits h ON h.linked_goal_id = g.id AND h.archived_at IS NULL
LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.log_date > CURRENT_DATE - INTERVAL '30 days'
WHERE g.archived_at IS NULL AND g.status != 'abandoned'
GROUP BY g.id, g.user_id, g.title, g.category, g.time_horizon, g.current_progress, g.target_date;

-- ============================================================================
-- PERMISSIONS & ROW LEVEL SECURITY (Optional but recommended)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation ON users
    FOR ALL
    USING (id = current_setting('app.user_id', true)::uuid);

CREATE POLICY profile_isolation ON profiles
    FOR ALL
    USING (user_id = current_setting('app.user_id', true)::uuid);

-- Note: In Server Actions, set the user context:
-- await db.execute(sql`SET app.user_id = ${session.user.id}`)

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Partitioning for large log tables (future-proofing)
-- Uncomment if data volume exceeds 1M rows

-- CREATE TABLE routine_logs_2026 PARTITION OF routine_logs
--     FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- CREATE TABLE habit_logs_2026 PARTITION OF habit_logs
--     FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- ============================================================================
-- FINAL NOTES
-- ============================================================================

-- This schema is designed for:
-- 1. Data integrity (foreign keys, constraints)
-- 2. Performance (indexes on all common queries)
-- 3. Auditability (audit_log table)
-- 4. Privacy (RLS enabled)
-- 5. Scalability (partitioning ready)
-- 6. Type safety (enums for all categorical data)
-- 7. Flexibility (JSONB for complex data)

-- Migration Strategy:
-- 1. Run this schema on empty database
-- 2. Seed insight_rules
-- 3. Create first user via registration flow
-- 4. All subsequent changes via migration files

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
