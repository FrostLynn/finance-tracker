import React from 'react';
import type { Account, AccountTotals } from '../types/finance';
import { formatRupiah } from '../utils/format';

interface AccountsViewProps {
  accounts: Account[];
  totals: AccountTotals | null;
  onAddAccountClick: () => void;
  onDeleteAccount: (id: string) => Promise<void>;
  onResetAllData: () => Promise<void>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  totals,
  onAddAccountClick,
  onDeleteAccount,
  onResetAllData,
}) => {
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
          <button
            onClick={onAddAccountClick}
            className="text-xs font-semibold text-ios-blue hover:text-white transition-colors bg-ios-bg border border-ios-border px-3 py-1.5 rounded-xl cursor-pointer"
          >
            + Tambah Akun
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="bg-ios-bg border border-ios-border/60 rounded-xl p-6 text-center">
            <div className="text-2xl mb-1">💳</div>
            <div className="text-sm font-semibold text-white">Belum Ada Sumber Dana</div>
            <div className="text-xs text-ios-secondary mt-1 mb-3">
              Mulai dari 0 dengan menambahkan rekening bank, e-wallet, atau paylater pertama Anda.
            </div>
            <button
              onClick={onAddAccountClick}
              className="py-2 px-4 bg-ios-blue text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              + Tambah Sumber Dana Baru
            </button>
          </div>
        ) : (
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
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
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

                  <div className="flex items-center gap-3">
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isPaylater && acc.current_balance < 0
                          ? 'text-ios-yellow'
                          : 'text-white'
                      }`}
                    >
                      {formatRupiah(acc.current_balance)}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus akun "${acc.name}" beserta transaksi terkaitnya?`)) {
                          onDeleteAccount(acc.id);
                        }
                      }}
                      className="text-ios-tertiary hover:text-ios-red p-1 text-xs transition-colors"
                      title="Hapus akun"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone: Reset All Data */}
      <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-ios-red uppercase tracking-wider mb-1">
          Hapus / Reset Data
        </h4>
        <p className="text-xs text-ios-secondary mb-3">
          Menghapus seluruh riwayat mutasi transaksi, target tabungan, dan daftar akun agar kembali mulai dari 0.
        </p>
        <button
          onClick={() => {
            const confirmed = confirm(
              'PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA (transaksi, akun, tabungan) dan mulai dari 0? Tindakan ini tidak dapat dibatalkan.'
            );
            if (confirmed) {
              onResetAllData();
            }
          }}
          className="w-full py-2.5 bg-rose-500/20 border border-rose-500/40 text-ios-red rounded-xl font-bold text-xs hover:bg-rose-500/30 transition-colors cursor-pointer"
        >
          Reset Seluruh Data (Mulai dari 0)
        </button>
      </div>
    </div>
  );
};
