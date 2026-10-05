import React, { useState } from 'react';
import type { AccountType, CreateAccountPayload } from '../types/finance';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAccountPayload) => Promise<void>;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('BANK');
  const [balanceStr, setBalanceStr] = useState('0');
  const [creditLimitStr, setCreditLimitStr] = useState('0');
  const [dueDay, setDueDay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama sumber dana tidak boleh kosong');
      return;
    }

    const currentBalance = parseInt(balanceStr.replace(/[^0-9-]/g, ''), 10) || 0;
    const creditLimit = parseInt(creditLimitStr.replace(/[^0-9]/g, ''), 10) || 0;
    let dueDayNum: number | undefined;
    if (dueDay) {
      dueDayNum = parseInt(dueDay, 10);
      if (dueDayNum < 1 || dueDayNum > 31) {
        setError('Tanggal jatuh tempo harus antara 1 sampai 31');
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        type,
        current_balance: currentBalance,
        credit_limit: creditLimit,
        due_day_of_month: dueDayNum,
      });
      // Reset form
      setName('');
      setType('BANK');
      setBalanceStr('0');
      setCreditLimitStr('0');
      setDueDay('');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal menambahkan sumber dana');
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
          <h2 className="text-base font-bold text-white">Tambah Sumber Dana</h2>
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
          {/* Account Name */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              Nama Akun / Dompet
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA Tabungan, GoPay, SPayLater"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-ios-blue"
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              Tipe Sumber Dana
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-ios-bg p-1 rounded-xl border border-ios-border/60 text-xs">
              <button
                type="button"
                onClick={() => setType('BANK')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  type === 'BANK' ? 'bg-ios-blue/20 text-ios-blue border border-ios-blue/40' : 'text-ios-secondary'
                }`}
              >
                Rekening Bank
              </button>
              <button
                type="button"
                onClick={() => setType('EWALLET')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  type === 'EWALLET' ? 'bg-ios-blue/20 text-ios-blue border border-ios-blue/40' : 'text-ios-secondary'
                }`}
              >
                E-Wallet
              </button>
              <button
                type="button"
                onClick={() => setType('PAYLATER')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  type === 'PAYLATER' ? 'bg-amber-500/20 text-ios-yellow border border-amber-500/40' : 'text-ios-secondary'
                }`}
              >
                Paylater (Utang)
              </button>
              <button
                type="button"
                onClick={() => setType('CASH')}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  type === 'CASH' ? 'bg-ios-blue/20 text-ios-blue border border-ios-blue/40' : 'text-ios-secondary'
                }`}
              >
                Tunai / Dompet
              </button>
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
              {type === 'PAYLATER' ? 'Saldo Utang Saat Ini (masukkan minus jika ada utang)' : 'Saldo Awal (Rp)'}
            </label>
            <input
              type="text"
              placeholder="0"
              value={balanceStr}
              onChange={(e) => setBalanceStr(e.target.value)}
              className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white tabular-nums focus:outline-none focus:border-ios-blue"
            />
          </div>

          {/* Paylater Specifics */}
          {type === 'PAYLATER' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
                  Limit Kredit (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={creditLimitStr}
                  onChange={(e) => setCreditLimitStr(e.target.value)}
                  className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white tabular-nums focus:outline-none focus:border-ios-blue"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-ios-secondary block mb-1">
                  Jatuh Tempo (Tgl 1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="25"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full bg-ios-bg border border-ios-border rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-ios-blue"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-ios-blue/30 active:scale-98 transition-transform disabled:opacity-50 mt-1 cursor-pointer"
          >
            {loading ? 'Menyimpan...' : 'Tambahkan Akun'}
          </button>
        </form>
      </div>
    </div>
  );
};
