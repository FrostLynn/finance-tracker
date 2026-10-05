import React from 'react';
import type { Account, AccountTotals } from '../types/finance';
import { formatRupiah } from '../utils/format';

interface AccountsViewProps {
  accounts: Account[];
  totals: AccountTotals | null;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts, totals }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Total Overview */}
      <div className="bg-ios-surface border border-ios-border rounded-2xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ios-secondary mb-3">
          Ringkasan Portofolio Akun
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ios-bg border border-ios-border/60 rounded-xl p-3">
            <span className="text-[11px] text-ios-secondary">Saldo Likuid Riil</span>
            <div className="text-base font-bold text-white tabular-nums mt-0.5">
              {formatRupiah(totals ? totals.total_liquid_balance : 0)}
            </div>
          </div>
          <div className="bg-ios-bg border border-ios-border/60 rounded-xl p-3">
            <span className="text-[11px] text-ios-yellow">Total Utang Paylater</span>
            <div className="text-base font-bold text-ios-yellow tabular-nums mt-0.5">
              {formatRupiah(totals ? totals.total_paylater_debt : 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="bg-ios-surface border border-ios-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ios-secondary">
            Daftar Sumber Dana
          </h3>
          <span className="text-xs text-ios-tertiary">{accounts.length} akun terdaftar</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {accounts.map((acc) => {
            const isPaylater = acc.type === 'PAYLATER';
            return (
              <div
                key={acc.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isPaylater
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-ios-bg border-ios-border/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{acc.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isPaylater
                          ? 'bg-amber-500/20 text-ios-yellow'
                          : 'bg-ios-blue/15 text-ios-blue'
                      }`}
                    >
                      {acc.type}
                    </span>
                  </div>
                  {isPaylater && acc.due_day_of_month && (
                    <div className="text-[11px] text-amber-200/70 mt-0.5">
                      Jatuh tempo setiap tgl {acc.due_day_of_month} • Limit: {formatRupiah(acc.credit_limit)}
                    </div>
                  )}
                </div>

                <div
                  className={`text-sm font-bold tabular-nums ${
                    isPaylater && acc.current_balance < 0
                      ? 'text-ios-yellow'
                      : 'text-white'
                  }`}
                >
                  {formatRupiah(acc.current_balance)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
