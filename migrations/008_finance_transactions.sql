-- Migration: Add finance transactions and expand account types
-- Date: 2026-01-31
-- Description: Add transaction logging, debt/loan account types, and interest rates

-- Create account type enum with new types
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('checking', 'savings', 'investment', 'credit_card', 'debt', 'loan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add interest_rate column to cash_accounts
ALTER TABLE cash_accounts 
  ADD COLUMN IF NOT EXISTS interest_rate numeric(5,2) DEFAULT 0 CHECK (interest_rate >= 0 AND interest_rate <= 100),
  ADD COLUMN IF NOT EXISTS account_type account_type;

-- Update existing accounts to have a type (default to checking)
UPDATE cash_accounts SET account_type = 'checking' WHERE account_type IS NULL;

-- Make account_type NOT NULL after setting defaults
ALTER TABLE cash_accounts ALTER COLUMN account_type SET NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN cash_accounts.interest_rate IS 'Interest rate percentage for loans/debts (0-100%)';
COMMENT ON COLUMN cash_accounts.account_type IS 'Type of account: checking, savings, investment, credit_card, debt, loan';

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES cash_accounts(id) ON DELETE CASCADE,
  amount numeric(15,2) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_accounts_type ON cash_accounts(user_id, account_type);

-- Add comments
COMMENT ON TABLE transactions IS 'Transaction log for all account activities';
COMMENT ON COLUMN transactions.transaction_type IS 'credit (+) or debit (-)';
COMMENT ON COLUMN transactions.amount IS 'Absolute amount (always positive, type determines direction)';
