import React from 'react';

export const BudgetPlaceholder: React.FC = () => {
  return (
    <div className="bg-ios-surface border border-ios-border rounded-2xl p-6 text-center">
      <div className="text-3xl mb-2">🎯</div>
      <h3 className="text-sm font-bold text-white mb-1">Target Anggaran Bulanan</h3>
      <p className="text-xs text-ios-secondary max-w-xs mx-auto mb-4">
        Fitur alokasi budget cerdas sedang dipersiapkan. Transaksi yang dicatat saat ini otomatis diakumulasikan ke dalam ringkasan bulanan.
      </p>
      <div className="bg-ios-bg border border-ios-border/60 rounded-xl p-3 text-left flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white font-medium">Batas Rekomendasi Bulanan</span>
          <span className="text-ios-blue font-bold">50 / 30 / 20</span>
        </div>
        <p className="text-[11px] text-ios-tertiary">
          50% Kebutuhan Pokok, 30% Keinginan & Hiburan, 20% Tabungan / Investasi.
        </p>
      </div>
    </div>
  );
};
