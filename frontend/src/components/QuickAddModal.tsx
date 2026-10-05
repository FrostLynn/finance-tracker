import React, { useState } from 'react';
import type { Account, Category, CreateTransactionPayload } from '../types/finance';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onSubmit: (payload: CreateTransactionPayload) => Promise<void>;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  onSubmit,
}) => {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Filter categories by selected type
  const availableCategories = categories.filter((c) => c.type === type);
  const effectiveCategoryId = categoryId || availableCategories[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!amount || amount <= 0) {
      setError('Nominal harus lebih besar dari 0');
      return;
    }
    if (!description.trim()) {
      setError('Keterangan tidak boleh kosong');
      return;
    }
    if (!accountId) {
      setError('Pilih sumber akun');
      return;
    }
    if (!effectiveCategoryId) {
      setError('Pilih kategori');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        account_id: accountId,
        category_id: effectiveCategoryId,
        amount,
        type,
        description: description.trim(),
        transaction_date: date,
      });
      // Reset form
      setAmountStr('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat menyimpan transaksi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[430px] bg-ios-surface border border-ios-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-ios-border/60">
          <h2 className="text-base font-bold text-white">Catat Transaksi</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ios-bg text-ios-secondary flex items-center justify-center hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="text-xs text-ios-red bg-rose-950/40 border border-rose-500/30 rounded-xl p-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-1 bg-ios-bg p-1 rounded-xl border border-ios-border/60">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500/20 text-ios-red border border-rose-500/40'
                  : 'text-ios-secondary'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setCategoryId('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-500/20 text-ios-green border border-emerald-500/40'
                  : 'text-ios-secondary'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              Nominal (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amountStr}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                if (raw) {
                  const num = parseInt(raw, 10);
                  setAmountStr(new Intl.NumberFormat('id-ID').format(num));
                } else {
                  setAmountStr('');
                }
              }}
              className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2.5 text-lg font-bold text-white tabular-nums focus:outline-none focus:border-ios-blue"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              Keterangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Nasi Padang, Bensin, Gaji"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-ios-blue"
              required
            />
          </div>

          {/* Account Picker */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              Sumber Akun
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-ios-blue"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              Kategori
            </label>
            <select
              value={effectiveCategoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-ios-blue"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-ios-blue"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-ios-blue/30 active:scale-98 transition-transform disabled:opacity-50 mt-1 cursor-pointer"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
};
