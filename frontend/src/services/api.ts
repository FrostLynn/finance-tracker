import type { AccountListResponse, Category, CreateTransactionPayload, MonthlySummary, Transaction } from '../types/finance';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async getAccounts(): Promise<AccountListResponse> {
    const res = await fetch(`${API_BASE}/accounts`);
    if (!res.ok) throw new Error('Gagal mengambil data akun');
    return res.json();
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
};
