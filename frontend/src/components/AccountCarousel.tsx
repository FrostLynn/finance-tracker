import React from 'react';
import type { Account } from '../types/finance';
import { formatRupiah } from '../utils/format';

interface AccountCarouselProps {
  accounts: Account[];
  onAddAccountClick?: () => void;
}

export const AccountCarousel: React.FC<AccountCarouselProps> = ({ accounts }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-xs font-bold uppercase tracking-wider text-ios-secondary">
          Dompet & Rekening
        </span>
        <span className="text-xs font-semibold text-ios-blue cursor-pointer">
          {accounts.length} Akun
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {accounts.map((acc) => {
          const isPaylater = acc.type === 'PAYLATER';
          return (
            <div
              key={acc.id}
              className={`flex-shrink-0 w-36 rounded-2xl p-3 border transition-all ${
                isPaylater
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-ios-surface border-ios-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isPaylater
                      ? 'bg-amber-500/20 text-ios-yellow border border-amber-500/40'
                      : 'bg-ios-blue/15 text-ios-blue border border-ios-blue/20'
                  }`}
                >
                  {acc.type}
                </span>
                {acc.due_day_of_month && (
                  <span className="text-[10px] text-ios-yellow font-medium">
                    Tgl {acc.due_day_of_month}
                  </span>
                )}
              </div>

              <div className="text-xs font-semibold text-white truncate">{acc.name}</div>
              <div
                className={`text-sm font-bold tabular-nums mt-1 ${
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
  );
};
