-- Migration: Update business module to track equity, valuation, and profits
-- Date: 2024
-- Description: Replace revenue tracking with equity percentage, valuation, and profit metrics

-- Add new columns for equity and valuation tracking
ALTER TABLE companies 
  ADD COLUMN IF NOT EXISTS equity_percentage numeric(5,2) CHECK (equity_percentage >= 0 AND equity_percentage <= 100),
  ADD COLUMN IF NOT EXISTS valuation numeric(15,2) CHECK (valuation >= 0),
  ADD COLUMN IF NOT EXISTS profits numeric(15,2);

-- Add comments for clarity
COMMENT ON COLUMN companies.equity_percentage IS 'Percentage of equity owned (0-100%)';
COMMENT ON COLUMN companies.valuation IS 'Current company valuation in currency';
COMMENT ON COLUMN companies.profits IS 'Net profit (can be negative for losses)';

-- Rename current_revenue to legacy_revenue for historical reference (optional)
-- If you want to preserve the data:
-- ALTER TABLE companies RENAME COLUMN current_revenue TO legacy_revenue;

-- Or drop it if not needed:
-- ALTER TABLE companies DROP COLUMN IF EXISTS current_revenue;

-- Note: Keep current_revenue for now to avoid data loss. 
-- You can drop it later after confirming the new fields work well.
