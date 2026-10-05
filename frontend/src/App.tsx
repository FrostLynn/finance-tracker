import { useEffect, useState, useCallback } from 'react';
import type {
  Account,
  Category,
  MonthlySummary,
  Transaction,
  CreateTransactionPayload,
  AccountTotals,
  SavingsGoal,
  CreateSavingsGoalPayload,
  CreateAccountPayload,
} from './types/finance';
import { api } from './services/api';
import { DynamicIsland } from './components/DynamicIsland';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { AccountCarousel } from './components/AccountCarousel';
import { PaylaterCard } from './components/PaylaterCard';
import { TransactionList } from './components/TransactionList';
import { SummaryView } from './components/SummaryView';
import { AccountsView } from './components/AccountsView';
import { SavingsView } from './components/SavingsView';
import { BottomNavigationDock, type NavTab } from './components/BottomNavigationDock';
import { QuickAddModal } from './components/QuickAddModal';
import { AddAccountModal } from './components/AddAccountModal';

export function App() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('mutasi');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Data states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totals, setTotals] = useState<AccountTotals | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [accRes, catRes, txRes, sumRes, savRes] = await Promise.all([
        api.getAccounts(),
        api.getCategories(),
        api.getTransactions(currentMonth),
        api.getSummary(currentMonth),
        api.getSavings(),
      ]);

      setAccounts(accRes.accounts);
      setTotals(accRes.totals);
      setCategories(catRes);
      setTransactions(txRes);
      setSummary(sumRes);
      setSavingsGoals(savRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Transaction handlers
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

  // Account handlers
  const handleCreateAccount = async (payload: CreateAccountPayload) => {
    await api.createAccount(payload);
    await loadData();
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await api.deleteAccount(id);
      await loadData();
    } catch (err) {
      alert('Gagal menghapus akun');
    }
  };

  // Savings handlers
  const handleCreateGoal = async (payload: CreateSavingsGoalPayload) => {
    await api.createSavingsGoal(payload);
    await loadData();
  };

  const handleDepositGoal = async (id: string, amount: number) => {
    await api.depositSavings(id, amount);
    await loadData();
  };

  const handleDeleteGoal = async (id: string) => {
    await api.deleteSavingsGoal(id);
    await loadData();
  };

  // Reset all data
  const handleResetAllData = async () => {
    try {
      await api.resetAllData();
      await loadData();
      alert('Seluruh data berhasil direset ke 0.');
    } catch (err) {
      alert('Gagal mereset data');
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg text-ios-text flex justify-center selection:bg-ios-blue/30">
      {/* Mobile Frame Container (max-w-[430px]) */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative px-4 pb-28 pt-1">
        {/* Modern App Header with Month Selector */}
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
                <AccountCarousel
                  accounts={accounts}
                  onAddAccountClick={() => setIsAddAccountOpen(true)}
                />
                <TransactionList
                  transactions={transactions}
                  onDelete={handleDeleteTransaction}
                />
              </>
            )}

            {activeTab === 'nabung' && (
              <SavingsView
                goals={savingsGoals}
                onCreateGoal={handleCreateGoal}
                onDeposit={handleDepositGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {activeTab === 'rekap' && <SummaryView summary={summary} />}

            {activeTab === 'akun' && (
              <AccountsView
                accounts={accounts}
                totals={totals}
                onAddAccountClick={() => setIsAddAccountOpen(true)}
                onDeleteAccount={handleDeleteAccount}
                onResetAllData={handleResetAllData}
              />
            )}
          </main>
        )}

        {/* 5-Column Symmetrical Floating Glass Dock */}
        <BottomNavigationDock
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickAddClick={() => {
            if (accounts.length === 0) {
              alert('Tambahkan minimal satu sumber dana (rekening/e-wallet) terlebih dahulu di tab Akun.');
              setActiveTab('akun');
              setIsAddAccountOpen(true);
              return;
            }
            setIsQuickAddOpen(true);
          }}
        />

        {/* Quick Add (+) Transaction Modal */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          accounts={accounts}
          categories={categories}
          onSubmit={handleCreateTransaction}
        />

        {/* Add Account Modal */}
        <AddAccountModal
          isOpen={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
          onSubmit={handleCreateAccount}
        />
      </div>
    </div>
  );
}

export default App;
