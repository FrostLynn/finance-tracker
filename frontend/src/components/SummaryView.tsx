import React from 'react';
import type { MonthlySummary } from '../types/finance';
import { formatRupiah } from '../utils/format';

interface SummaryViewProps {
  summary: MonthlySummary | null;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="bg-ios-surface border border-ios-border rounded-2xl p-8 text-center text-ios-secondary">
        Memuat ringkasan bulanan...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Monthly Recap Cards */}
      <div className="bg-ios-surface border border-ios-border rounded-2xl p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ios-secondary mb-3">
          Ringkasan Arus Kas ({summary.month})
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-ios-bg border border-ios-border/60 rounded-xl p-3">
            <span className="text-[11px] text-ios-secondary">Total Pemasukan</span>
            <div className="text-base font-bold text-ios-green tabular-nums mt-0.5">
              +{formatRupiah(summary.total_income)}
            </div>
          </div>
          <div className="bg-ios-bg border border-ios-border/60 rounded-xl p-3">
            <span className="text-[11px] text-ios-secondary">Total Pengeluaran</span>
            <div className="text-base font-bold text-ios-red tabular-nums mt-0.5">
              -{formatRupiah(summary.total_expense)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-ios-border/50 flex items-center justify-between">
          <span className="text-xs text-ios-secondary">Sisa Arus Kas (Net):</span>
          <span
            className={`text-base font-bold tabular-nums ${
              summary.net_cashflow >= 0 ? 'text-ios-green' : 'text-ios-red'
            }`}
          >
            {summary.net_cashflow >= 0
              ? `+${formatRupiah(summary.net_cashflow)}`
              : formatRupiah(summary.net_cashflow)}
          </span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-ios-surface border border-ios-border rounded-2xl p-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-ios-secondary mb-3">
          Distribusi Pengeluaran Kategori
        </h3>

        {summary.category_breakdown.length === 0 ? (
          <div className="text-xs text-ios-secondary text-center py-4">
            Belum ada pengeluaran yang tercatat pada bulan ini.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {summary.category_breakdown.map((cat) => (
              <div key={cat.category_id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{cat.category_name}</span>
                  <div className="tabular-nums flex items-center gap-2">
                    <span className="text-ios-secondary font-medium">{cat.percentage}%</span>
                    <span className="font-bold text-white">{formatRupiah(cat.total_amount)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-ios-bg rounded-full overflow-hidden border border-ios-border/40">
                  <div
                    className="h-full bg-ios-blue rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paylater Status */}
      {summary.active_paylater_bill > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="text-xs font-bold text-ios-yellow uppercase tracking-wider mb-1">
            Status Utang Paylater
          </div>
          <div className="text-lg font-bold text-ios-yellow tabular-nums">
            {formatRupiah(summary.active_paylater_bill)}
          </div>
          <p className="text-xs text-amber-200/60 mt-1">
            Pastikan alokasi saldo mencukupi sebelum tanggal jatuh tempo tagihan.
          </p>
        </div>
      )}
    </div>
  );
};
