-- Migration: Add Missing Core Tables
-- Date: 2026-01-30
-- Description: Create life_seasons, accountability system, finance, and business tables

-- ============================================================================
-- PART 1: Life Seasons Module (Birthday automation foundation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS life_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    season_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    key_learnings TEXT,
    defining_moments TEXT,
    annual_theme VARCHAR(255),
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_life_seasons_user_id ON life_seasons(user_id);
CREATE INDEX idx_life_seasons_current ON life_seasons(user_id, is_current);

-- Ensure only one current season per user
CREATE UNIQUE INDEX idx_life_seasons_one_current 
ON life_seasons(user_id) 
WHERE is_current = TRUE;

-- Add foreign key constraint to goals table
ALTER TABLE goals 
ADD CONSTRAINT fk_goals_life_season 
FOREIGN KEY (life_season_id) REFERENCES life_seasons(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 2: Accountability System (Point of Light)
-- ============================================================================

-- Accountability Links (who can see your data)
CREATE TABLE IF NOT EXISTS accountability_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accountability_partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scopes_granted permission_scope[] NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_accountability_pair UNIQUE(owner_id, accountability_partner_id),
    CONSTRAINT no_self_accountability CHECK (owner_id != accountability_partner_id)
);

CREATE INDEX idx_accountability_links_owner ON accountability_links(owner_id);
CREATE INDEX idx_accountability_links_partner ON accountability_links(accountability_partner_id);
CREATE INDEX idx_accountability_links_status ON accountability_links(status);

-- Accountability Comments (feedback from partners)
CREATE TABLE IF NOT EXISTS accountability_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES accountability_links(id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    comment TEXT NOT NULL,
    is_prayer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_accountability_comments_link ON accountability_comments(link_id);
CREATE INDEX idx_accountability_comments_resource ON accountability_comments(resource_type, resource_id);
CREATE INDEX idx_accountability_comments_commenter ON accountability_comments(commenter_id);

-- Accountability Alerts (automated triggers)
CREATE TABLE IF NOT EXISTS accountability_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES accountability_links(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    message TEXT NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_accountability_alerts_link ON accountability_alerts(link_id);
CREATE INDEX idx_accountability_alerts_acknowledged ON accountability_alerts(link_id, acknowledged_at);

-- Invite Tokens (for email invitations)
CREATE TABLE IF NOT EXISTS invite_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    scopes_offered permission_scope[] NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX idx_invite_tokens_owner ON invite_tokens(owner_id);
CREATE INDEX idx_invite_tokens_expires ON invite_tokens(expires_at);

-- ============================================================================
-- PART 3: Finance Module - Multiple Accounts & Savings Goals
-- ============================================================================

-- Cash Accounts (multiple checking, savings, cash accounts)
CREATE TABLE IF NOT EXISTS cash_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    current_balance DECIMAL(15,2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cash_accounts_user ON cash_accounts(user_id);
CREATE INDEX idx_cash_accounts_active ON cash_accounts(user_id, is_active);

-- Savings Goals (specific savings targets)
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0 NOT NULL,
    target_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_savings_goals_user ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_active ON savings_goals(user_id, is_active);

-- ============================================================================
-- PART 4: Business Module - Cap Table & Products
-- ============================================================================

-- Cap Table Entries (equity ownership tracking)
CREATE TABLE IF NOT EXISTS cap_table_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    stakeholder_name VARCHAR(255) NOT NULL,
    stakeholder_type VARCHAR(50) NOT NULL,
    equity_percentage DECIMAL(5,2) NOT NULL,
    shares_owned BIGINT,
    investment_amount DECIMAL(15,2),
    entry_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT valid_equity_percentage CHECK (equity_percentage >= 0 AND equity_percentage <= 100)
);

CREATE INDEX idx_cap_table_company ON cap_table_entries(company_id);
CREATE INDEX idx_cap_table_active ON cap_table_entries(company_id, is_active);

-- Company Products (product-level equity and revenue)
CREATE TABLE IF NOT EXISTS company_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    equity_split JSONB,
    revenue DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    launched_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_company_products_company ON company_products(company_id);
CREATE INDEX idx_company_products_active ON company_products(company_id, is_active);

-- ============================================================================
-- Migration complete
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 002_add_missing_tables.sql completed successfully';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - life_seasons (birthday automation foundation)';
    RAISE NOTICE '  - accountability_links, accountability_comments, accountability_alerts, invite_tokens';
    RAISE NOTICE '  - cash_accounts, savings_goals';
    RAISE NOTICE '  - cap_table_entries, company_products';
END $$;
