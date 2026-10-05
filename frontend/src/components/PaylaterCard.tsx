import React from 'react';
import { formatRupiah } from '../utils/format';

interface PaylaterCardProps {
  totalPaylaterDebt: number;
}

export const PaylaterCard: React.FC<PaylaterCardProps> = ({ totalPaylaterDebt }) => {
  if (totalPaylaterDebt <= 0) return null;

  return (
    <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-ios-yellow">
          Kewajiban Paylater Aktif
        </div>
        <div className="text-base font-bold text-ios-yellow tabular-nums mt-0.5">
          {formatRupiah(totalPaylaterDebt)}
        </div>
        <div className="text-[11px] text-amber-200/60 mt-0.5">
          Tagihan jatuh tempo bulan ini
        </div>
      </div>
      <div className="bg-amber-500/20 border border-amber-500/40 text-ios-yellow text-xs font-semibold px-3 py-1.5 rounded-xl">
        Perlu Dibayar
      </div>
    </div>
  );
};
