
import BalanceCard from '@/components/BalanceCard';
import BalanceTable from '@/components/BalanceTable';
import TransactionList from '@/components/TransactionList';
import QuickActions from '@/components/QuickActions';
import { Transaction } from '@/services/transactionService';

interface DashboardContentProps {
  balances: Record<string, number>;
  transactions: Transaction[];
}

const DashboardContent = ({ balances, transactions }: DashboardContentProps) => {
  // Safe defaults
  const safeBalances = balances || {
    USD: 0,
    EUR: 0,
    BTC: 0,
    ETH: 0
  };
  
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Balance Card */}
      <BalanceCard 
        className="lg:col-span-2" 
        balances={safeBalances}
        isLoading={false}
      />
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Balance Table */}
      <BalanceTable 
        balances={safeBalances}
        isLoading={false}
        className="lg:col-span-3"
      />
      
      {/* Transaction History */}
      <TransactionList 
        transactions={safeTransactions}
        isLoading={false}
        className="lg:col-span-3"
      />
    </div>
  );
};

export default DashboardContent;
