import React from 'react';

export type NavTab = 'mutasi' | 'nabung' | 'rekap' | 'akun';

interface BottomNavigationDockProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickAddClick: () => void;
}

export const BottomNavigationDock: React.FC<BottomNavigationDockProps> = ({
  activeTab,
  onTabChange,
  onQuickAddClick,
}) => {
  return (
    <nav className="fixed bottom-4 left-3.5 right-3.5 max-w-[430px] mx-auto z-40 select-none">
      <div className="ios-glass-nav rounded-[28px] h-16 shadow-2xl grid grid-cols-[1fr_1fr_64px_1fr_1fr] items-center px-1">
        {/* Tab 1: Mutasi */}
        <button
          onClick={() => onTabChange('mutasi')}
          className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'mutasi' ? 'text-ios-blue font-semibold' : 'text-ios-secondary hover:text-white'
          }`}
          aria-label="Tab Mutasi"
        >
          <span className="text-lg leading-none">📑</span>
          <span className="text-[10px]">Mutasi</span>
        </button>

        {/* Tab 2: Nabung */}
        <button
          onClick={() => onTabChange('nabung')}
          className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'nabung' ? 'text-ios-blue font-semibold' : 'text-ios-secondary hover:text-white'
          }`}
          aria-label="Tab Nabung"
        >
          <span className="text-lg leading-none">🐷</span>
          <span className="text-[10px]">Nabung</span>
        </button>

        {/* Center 50% Quick Add Action Button */}
        <div className="flex justify-center items-center -translate-y-2">
          <button
            onClick={onQuickAddClick}
            className="w-[52px] h-[52px] rounded-full bg-ios-blue text-white text-2xl font-light flex items-center justify-center shadow-lg shadow-ios-blue/40 border-2 border-white/30 active:scale-90 transition-transform cursor-pointer"
            aria-label="Tambah Transaksi Cepat"
          >
            +
          </button>
        </div>

        {/* Tab 3: Rekap */}
        <button
          onClick={() => onTabChange('rekap')}
          className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'rekap' ? 'text-ios-blue font-semibold' : 'text-ios-secondary hover:text-white'
          }`}
          aria-label="Tab Rekap"
        >
          <span className="text-lg leading-none">📊</span>
          <span className="text-[10px]">Rekap</span>
        </button>

        {/* Tab 4: Akun */}
        <button
          onClick={() => onTabChange('akun')}
          className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:scale-95 cursor-pointer ${
            activeTab === 'akun' ? 'text-ios-blue font-semibold' : 'text-ios-secondary hover:text-white'
          }`}
          aria-label="Tab Akun"
        >
          <span className="text-lg leading-none">💳</span>
          <span className="text-[10px]">Akun</span>
        </button>
      </div>
    </nav>
  );
};
