import type {
  Account,
  AccountListResponse,
  Category,
  CreateAccountPayload,
  CreateSavingsGoalPayload,
  CreateTransactionPayload,
  MonthlySummary,
  SavingsGoal,
  Transaction,
} from '../types/finance';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async getAccounts(): Promise<AccountListResponse> {
    const res = await fetch(`${API_BASE}/accounts`);
    if (!res.ok) throw new Error('Gagal mengambil data akun');
    return res.json();
  },

  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal membuat akun');
    }
    return res.json();
  },

  async deleteAccount(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal menghapus akun');
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Gagal mengambil kategori');
    return res.json();
  },

  async getTransactions(month?: string): Promise<Transaction[]> {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`${API_BASE}/transactions${query}`);
    if (!res.ok) throw new Error('Gagal mengambil mutasi transaksi');
    return res.json();
  },

  async createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menyimpan transaksi');
    }
    return res.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal menghapus transaksi');
  },

  async getSummary(month: string): Promise<MonthlySummary> {
    const res = await fetch(`${API_BASE}/summary?month=${month}`);
    if (!res.ok) throw new Error('Gagal mengambil ringkasan bulanan');
    return res.json();
  },

  async getSavings(): Promise<SavingsGoal[]> {
    const res = await fetch(`${API_BASE}/savings`);
    if (!res.ok) throw new Error('Gagal mengambil daftar tabungan');
    return res.json();
  },

  async createSavingsGoal(payload: CreateSavingsGoalPayload): Promise<SavingsGoal> {
    const res = await fetch(`${API_BASE}/savings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal membuat target tabungan');
    }
    return res.json();
  },

  async depositSavings(id: string, amount: number): Promise<void> {
    const res = await fetch(`${API_BASE}/savings/${id}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Gagal menambah tabungan');
  },

  async deleteSavingsGoal(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/savings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal menghapus target tabungan');
  },

  async resetAllData(): Promise<void> {
    const res = await fetch(`${API_BASE}/system/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Gagal mereset semua data');
  },
};
