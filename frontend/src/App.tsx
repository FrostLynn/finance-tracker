import { useEffect, useState, useCallback } from 'react';
import type { Account, Category, MonthlySummary, Transaction, CreateTransactionPayload, AccountTotals } from './types/finance';
import { api } from './services/api';
import { DynamicIsland } from './components/DynamicIsland';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { AccountCarousel } from './components/AccountCarousel';
import { PaylaterCard } from './components/PaylaterCard';
import { TransactionList } from './components/TransactionList';
import { SummaryView } from './components/SummaryView';
import { AccountsView } from './components/AccountsView';
import { BudgetPlaceholder } from './components/BudgetPlaceholder';
import { BottomNavigationDock, type NavTab } from './components/BottomNavigationDock';
import { QuickAddModal } from './components/QuickAddModal';

export function App() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('mutasi');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Data states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totals, setTotals] = useState<AccountTotals | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [accRes, catRes, txRes, sumRes] = await Promise.all([
        api.getAccounts(),
        api.getCategories(),
        api.getTransactions(currentMonth),
        api.getSummary(currentMonth),
      ]);

      setAccounts(accRes.accounts);
      setTotals(accRes.totals);
      setCategories(catRes);
      setTransactions(txRes);
      setSummary(sumRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTransaction = async (payload: CreateTransactionPayload) => {
    await api.createTransaction(payload);
    await loadData();
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      await loadData();
    } catch (err) {
      alert('Gagal menghapus transaksi');
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg text-ios-text flex justify-center selection:bg-ios-blue/30">
      {/* Mobile Frame Container (max-w-[430px]) */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative px-4 pb-28 pt-1">
        {/* Dynamic Island & Month Navigator */}
        <DynamicIsland
          currentMonth={currentMonth}
          onMonthChange={(m) => setCurrentMonth(m)}
        />

        {loading && !summary ? (
          <div className="flex-1 flex items-center justify-center text-ios-secondary text-sm">
            Memuat data...
          </div>
        ) : (
          <main className="flex-1 flex flex-col gap-4 mt-2">
            {activeTab === 'mutasi' && (
              <>
                <HeroBalanceCard
                  totalLiquidBalance={totals ? totals.total_liquid_balance : 0}
                  summary={summary}
                />
                <PaylaterCard
                  totalPaylaterDebt={totals ? totals.total_paylater_debt : 0}
                />
                <AccountCarousel accounts={accounts} />
                <TransactionList
                  transactions={transactions}
                  onDelete={handleDeleteTransaction}
                />
              </>
            )}

            {activeTab === 'budget' && <BudgetPlaceholder />}

            {activeTab === 'rekap' && <SummaryView summary={summary} />}

            {activeTab === 'akun' && (
              <AccountsView accounts={accounts} totals={totals} />
            )}
          </main>
        )}

        {/* 5-Column Symmetrical Floating Glass Dock */}
        <BottomNavigationDock
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickAddClick={() => setIsQuickAddOpen(true)}
        />

        {/* Quick Add (+) Transaction Modal */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          accounts={accounts}
          categories={categories}
          onSubmit={handleCreateTransaction}
        />
      </div>
    </div>
  );
}

export default App;
