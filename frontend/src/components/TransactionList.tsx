import React from 'react';
import type { Transaction } from '../types/finance';
import { formatRupiah, formatDateIndo } from '../utils/format';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-ios-surface border border-ios-border rounded-2xl p-8 text-center">
        <div className="text-3xl mb-2">📑</div>
        <div className="text-sm font-semibold text-white">Belum Ada Transaksi</div>
        <div className="text-xs text-ios-secondary mt-1">
          Klik tombol (+) di bawah untuk mencatat pengeluaran atau pemasukan pertama.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-xs font-bold uppercase tracking-wider text-ios-secondary">
          Mutasi Terakhir
        </span>
        <span className="text-xs text-ios-tertiary">
          {transactions.length} mutasi
        </span>
      </div>

      <div className="bg-ios-surface border border-ios-border rounded-2xl divide-y divide-ios-border/60 overflow-hidden">
        {transactions.map((tx) => {
          const isExpense = tx.type === 'EXPENSE';
          return (
            <div
              key={tx.id}
              className="p-3.5 flex items-center justify-between hover:bg-ios-elevated/40 transition-colors"
            >
              {/* Left Column: Icon & Info */}
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border ${
                    isExpense
                      ? 'bg-rose-950/30 border-rose-500/20 text-ios-red'
                      : 'bg-emerald-950/30 border-emerald-500/20 text-ios-green'
                  }`}
                >
                  {isExpense ? '🍜' : '💼'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {tx.description}
                  </div>
                  <div className="text-[11px] text-ios-secondary flex items-center gap-1.5 mt-0.5">
                    <span>{tx.account_name || 'Akun'}</span>
                    <span>•</span>
                    <span>{tx.category_name || 'Kategori'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Amount & Date */}
              <div className="text-right flex-shrink-0 flex items-center gap-3">
                <div>
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      isExpense ? 'text-ios-red' : 'text-ios-green'
                    }`}
                  >
                    {isExpense ? `-${formatRupiah(tx.amount)}` : `+${formatRupiah(tx.amount)}`}
                  </div>
                  <div className="text-[10px] text-ios-tertiary mt-0.5">
                    {formatDateIndo(tx.transaction_date)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Hapus transaksi "${tx.description}"? Saldo akun akan dikembalikan.`)) {
                      onDelete(tx.id);
                    }
                  }}
                  className="text-ios-tertiary hover:text-ios-red p-1 rounded-lg transition-colors text-xs"
                  title="Hapus transaksi"
                  aria-label="Hapus transaksi"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
