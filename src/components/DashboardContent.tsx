
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Balance Card */}
      <BalanceCard 
        className="lg:col-span-2" 
        balances={balances}
        isLoading={false}
      />
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Balance Table */}
      <BalanceTable 
        balances={balances}
        isLoading={false}
        className="lg:col-span-3"
      />
      
      {/* Transaction History */}
      <TransactionList 
        transactions={transactions} 
        isLoading={false}
        className="lg:col-span-3"
      />
    </div>
  );
};

export default DashboardContent;
