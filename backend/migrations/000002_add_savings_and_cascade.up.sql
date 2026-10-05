-- Table: savings_goals (Fitur Nabung)
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    target_amount BIGINT NOT NULL CHECK (target_amount > 0),
    current_amount BIGINT NOT NULL DEFAULT 0,
    target_date DATE,
    icon VARCHAR(50) NOT NULL DEFAULT 'piggy-bank',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Change foreign key on transactions.account_id to ON DELETE CASCADE
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_account_id_fkey;
ALTER TABLE transactions ADD CONSTRAINT transactions_account_id_fkey
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
