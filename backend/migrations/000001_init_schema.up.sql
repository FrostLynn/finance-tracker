-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: accounts
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('BANK', 'EWALLET', 'PAYLATER', 'CASH')),
    current_balance BIGINT NOT NULL DEFAULT 0,
    credit_limit BIGINT NOT NULL DEFAULT 0,
    due_day_of_month INT CHECK (due_day_of_month IS NULL OR (due_day_of_month >= 1 AND due_day_of_month <= 31)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    icon VARCHAR(50) NOT NULL DEFAULT 'tag',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount BIGINT NOT NULL CHECK (amount > 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    description VARCHAR(255) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category_id);

-- Default categories
INSERT INTO categories (name, type, icon) VALUES
    ('Makan & Minum', 'EXPENSE', 'utensils'),
    ('Transportasi', 'EXPENSE', 'car'),
    ('Tagihan & Utilitas', 'EXPENSE', 'receipt'),
    ('Belanja Harian', 'EXPENSE', 'shopping-cart'),
    ('Elektronik & Gadget', 'EXPENSE', 'laptop'),
    ('Hiburan', 'EXPENSE', 'film'),
    ('Gaji Utama', 'INCOME', 'briefcase'),
    ('Side Project', 'INCOME', 'code'),
    ('Investasi', 'INCOME', 'trending-up')
ON CONFLICT DO NOTHING;
