import React, { useState } from 'react';
import type { CreateSavingsGoalPayload, SavingsGoal } from '../types/finance';
import { formatRupiah, formatDateIndo } from '../utils/format';

interface SavingsViewProps {
  goals: SavingsGoal[];
  onCreateGoal: (payload: CreateSavingsGoalPayload) => Promise<void>;
  onDeposit: (id: string, amount: number) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  goals,
  onCreateGoal,
  onDeposit,
  onDeleteGoal,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);

  // Form states for creating goal
  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state for deposit
  const [depositAmountStr, setDepositAmountStr] = useState('');

  const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseInt(targetAmountStr.replace(/[^0-9]/g, ''), 10);
    if (!name.trim() || !targetAmount || targetAmount <= 0) {
      alert('Nama dan target tabungan harus diisi dengan benar');
      return;
    }

    try {
      setLoading(true);
      await onCreateGoal({
        name: name.trim(),
        target_amount: targetAmount,
        target_date: targetDate || undefined,
      });
      setName('');
      setTargetAmountStr('');
      setTargetDate('');
      setIsCreateOpen(false);
    } catch {
      alert('Gagal membuat target tabungan');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const amount = parseInt(depositAmountStr.replace(/[^0-9]/g, ''), 10);
    if (!amount || amount <= 0) {
      alert('Nominal tabungan harus lebih dari 0');
      return;
    }

    try {
      setLoading(true);
      await onDeposit(depositGoalId, amount);
      setDepositAmountStr('');
      setDepositGoalId(null);
    } catch {
      alert('Gagal menambahkan tabungan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Overview Card */}
      <div className="ios-glass-hero rounded-3xl p-4 shadow-xl border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-ios-secondary">
            Total Celengan Tabungan
          </span>
          <span className="text-[11px] font-semibold text-ios-blue bg-ios-blue/15 border border-ios-blue/25 rounded-full px-2 py-0.5">
            {goals.length} Target Aktif
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white tabular-nums mb-2">
          {formatRupiah(totalSaved)}
        </div>
        <div className="text-xs text-ios-secondary flex items-center justify-between pt-2 border-t border-white/5">
          <span>Total Akumulasi Target:</span>
          <span className="font-semibold text-white tabular-nums">{formatRupiah(totalTarget)}</span>
        </div>
      </div>

      {/* Header & Create Button */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-bold uppercase tracking-wider text-ios-secondary">
          Target Impian & Tabungan
        </span>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="text-xs font-semibold text-ios-blue hover:text-white transition-colors bg-ios-surface border border-ios-border px-3 py-1.5 rounded-xl cursor-pointer"
        >
          + Target Baru
        </button>
      </div>

      {/* Goal Cards List */}
      {goals.length === 0 ? (
        <div className="bg-ios-surface border border-ios-border rounded-2xl p-8 text-center">
          <div className="text-3xl mb-2">🐷</div>
          <div className="text-sm font-semibold text-white">Belum Ada Target Tabungan</div>
          <div className="text-xs text-ios-secondary mt-1 mb-4">
            Mulai rencanakan tabungan untuk dana darurat, liburan, atau gadget impian Anda.
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="py-2.5 px-4 bg-ios-blue text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            + Buat Target Tabungan Pertama
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((goal) => {
            const pct = Math.min(
              Math.round((goal.current_amount / goal.target_amount) * 100),
              100
            );
            return (
              <div
                key={goal.id}
                className="bg-ios-surface border border-ios-border rounded-2xl p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{goal.name}</h4>
                    {goal.target_date && (
                      <span className="text-[11px] text-ios-tertiary">
                        Target tercapai: {formatDateIndo(goal.target_date)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-ios-green tabular-nums">
                      {formatRupiah(goal.current_amount)}
                    </div>
                    <div className="text-[10px] text-ios-tertiary tabular-nums">
                      dari {formatRupiah(goal.target_amount)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-ios-bg rounded-full overflow-hidden border border-ios-border/40">
                  <div
                    className="h-full bg-ios-green rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-ios-secondary">
                    Tercapai {pct}%
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDepositGoalId(goal.id)}
                      className="px-3 py-1 bg-ios-blue/15 border border-ios-blue/30 text-ios-blue text-xs font-bold rounded-lg hover:bg-ios-blue/25 transition-colors cursor-pointer"
                    >
                      + Nabung
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus target tabungan "${goal.name}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="text-ios-tertiary hover:text-ios-red p-1 text-xs transition-colors"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Goal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[430px] bg-ios-surface border border-ios-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-ios-border/60">
              <h2 className="text-base font-bold text-white">Target Tabungan Baru</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-ios-bg text-ios-secondary flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
                  Nama Target / Impian
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dana Darurat, MacBook Pro, Liburan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-ios-blue"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
                  Nominal Target (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={targetAmountStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    if (raw) {
                      const num = parseInt(raw, 10);
                      setTargetAmountStr(new Intl.NumberFormat('id-ID').format(num));
                    } else {
                      setTargetAmountStr('');
                    }
                  }}
                  className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2.5 text-sm font-bold text-white tabular-nums focus:outline-none focus:border-ios-blue"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
                  Target Tanggal Tercapai (Opsional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-ios-blue"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-ios-blue/30 active:scale-98 transition-transform disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Simpan Target Tabungan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deposit */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-[430px] bg-ios-surface border border-ios-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-ios-border/60">
              <h2 className="text-base font-bold text-white">Tambah Tabungan</h2>
              <button
                onClick={() => setDepositGoalId(null)}
                className="w-8 h-8 rounded-full bg-ios-bg text-ios-secondary flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
                  Nominal yang Ditabung (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={depositAmountStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    if (raw) {
                      const num = parseInt(raw, 10);
                      setDepositAmountStr(new Intl.NumberFormat('id-ID').format(num));
                    } else {
                      setDepositAmountStr('');
                    }
                  }}
                  className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2.5 text-lg font-bold text-white tabular-nums focus:outline-none focus:border-ios-blue"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ios-green text-black rounded-xl font-bold text-sm shadow-lg shadow-ios-green/30 active:scale-98 transition-transform disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Masukkan ke Celengan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
