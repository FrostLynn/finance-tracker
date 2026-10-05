import React from 'react';

interface DynamicIslandProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ currentMonth, onMonthChange }) => {
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const prevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const displayLabel = `${monthNames[month - 1] || ''} ${year}`;

  return (
    <div className="w-full pt-3 pb-2 px-4 flex flex-col items-center select-none">
      {/* iOS Dynamic Island Hardware Pill */}
      <div className="w-28 h-8 bg-black rounded-full flex items-center justify-between px-3 shadow-md border border-neutral-900 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-950 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-ios-green animate-pulse" />
        </div>
      </div>

      {/* Month Navigator Header Bar */}
      <div className="w-full flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ios-secondary">
            Pelacak Keuangan
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            {displayLabel}
          </h1>
        </div>

        {/* Month Arrows */}
        <div className="flex items-center gap-1 bg-ios-surface border border-ios-border rounded-xl p-1">
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ios-secondary hover:text-white hover:bg-ios-subtle transition-colors text-sm font-semibold active:scale-95"
            aria-label="Bulan sebelumnya"
          >
            ‹
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ios-secondary hover:text-white hover:bg-ios-subtle transition-colors text-sm font-semibold active:scale-95"
            aria-label="Bulan berikutnya"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
