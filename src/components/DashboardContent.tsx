
import BalanceCard from '@/components/BalanceCard';
import BalanceTable from '@/components/BalanceTable';
import TransactionList from '@/components/TransactionList';
import QuickActions from '@/components/QuickActions';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/services/transactionService';

interface DashboardContentProps {
  balances: Record<string, number>;
  transactions: Transaction[];
  onRefresh: () => void;
}

const DashboardContent = ({ balances, transactions, onRefresh }: DashboardContentProps) => {
  // Set default values for balances and transactions
  const safeBalances = balances || {
    USD: 0,
    EUR: 0,
    BTC: 0,
    ETH: 0
  };
  
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <>
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your Fusion Pay account</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <BalanceCard 
          className="lg:col-span-2" 
          balances={safeBalances}
        />
        
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Balance Table */}
        <BalanceTable 
          balances={safeBalances}
          className="lg:col-span-3"
        />
        
        {/* Transaction History */}
        <TransactionList 
          transactions={safeTransactions}
          className="lg:col-span-3"
        />
      </div>
    </>
  );
};

export default DashboardContent;
