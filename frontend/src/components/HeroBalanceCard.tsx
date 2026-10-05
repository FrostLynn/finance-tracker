import React from 'react';
import { formatRupiah } from '../utils/format';
import type { MonthlySummary } from '../types/finance';

interface HeroBalanceCardProps {
  totalLiquidBalance: number;
  summary: MonthlySummary | null;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({ totalLiquidBalance, summary }) => {
  const netCashflow = summary ? summary.net_cashflow : 0;
  const totalIncome = summary ? summary.total_income : 0;
  const totalExpense = summary ? summary.total_expense : 0;
  const savingsRate = summary ? summary.savings_rate_percentage : 0;

  return (
    <div className="ios-glass-hero rounded-3xl p-5 shadow-xl border border-white/10 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-ios-secondary">
          Total Saldo Likuid
        </span>
        {savingsRate > 0 && (
          <span className="text-[11px] font-semibold text-ios-green bg-ios-green/15 border border-ios-green/25 rounded-full px-2 py-0.5">
            +{savingsRate}% Tabungan
          </span>
        )}
      </div>

      {/* Main Balance Number */}
      <div className="text-3xl font-extrabold tracking-tight tabular-nums text-white mb-4">
        {formatRupiah(totalLiquidBalance)}
      </div>

      {/* Sub Cards: Income & Expense */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income Card */}
        <div className="bg-ios-surface/90 border border-ios-border rounded-2xl p-3">
          <div className="text-[11px] font-medium text-ios-secondary flex items-center gap-1">
            <span className="text-ios-green font-bold">↓</span> Pemasukan
          </div>
          <div className="text-sm font-bold text-ios-green tabular-nums mt-1">
            +{formatRupiah(totalIncome)}
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-ios-surface/90 border border-ios-border rounded-2xl p-3">
          <div className="text-[11px] font-medium text-ios-secondary flex items-center gap-1">
            <span className="text-ios-red font-bold">↑</span> Pengeluaran
          </div>
          <div className="text-sm font-bold text-ios-red tabular-nums mt-1">
            -{formatRupiah(totalExpense)}
          </div>
        </div>
      </div>

      {/* Net Cashflow indicator */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-ios-secondary">Arus Kas Bersih Bulan Ini:</span>
        <span
          className={`font-semibold tabular-nums ${
            netCashflow >= 0 ? 'text-ios-green' : 'text-ios-red'
          }`}
        >
          {netCashflow >= 0 ? `+${formatRupiah(netCashflow)}` : formatRupiah(netCashflow)}
        </span>
      </div>
    </div>
  );
};
