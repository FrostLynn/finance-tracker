import React from 'react';

interface HeaderProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
}

export const DynamicIsland: React.FC<HeaderProps> = ({ currentMonth, onMonthChange }) => {
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
    <header className="w-full pt-4 pb-2 px-1 flex items-center justify-between select-none">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-ios-secondary">
          FinanceFlow
        </span>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
          {displayLabel}
        </h1>
      </div>

      {/* Month Navigator Controls */}
      <div className="flex items-center gap-1 bg-ios-surface border border-ios-border rounded-xl p-1">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-ios-secondary hover:text-white hover:bg-ios-subtle transition-colors text-sm font-semibold active:scale-95 cursor-pointer"
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-ios-secondary hover:text-white hover:bg-ios-subtle transition-colors text-sm font-semibold active:scale-95 cursor-pointer"
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>
    </header>
  );
};
