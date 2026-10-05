export type AccountType = 'BANK' | 'EWALLET' | 'PAYLATER' | 'CASH';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  current_balance: number;
  credit_limit: number;
  due_day_of_month?: number;
  created_at: string;
  updated_at: string;
}

export interface AccountTotals {
  total_liquid_balance: number;
  total_paylater_debt: number;
}

export interface AccountListResponse {
  accounts: Account[];
  totals: AccountTotals;
}

export interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  account_name?: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  description: string;
  transaction_date: string;
  created_at: string;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  category_icon: string;
  total_amount: number;
  percentage: number;
  transaction_count: number;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expense: number;
  net_cashflow: number;
  savings_rate_percentage: number;
  active_paylater_bill: number;
  category_breakdown: CategoryBreakdown[];
}

export interface CreateTransactionPayload {
  account_id: string;
  category_id: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  description: string;
  transaction_date: string;
}
