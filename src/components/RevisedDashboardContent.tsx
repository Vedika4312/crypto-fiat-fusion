
import { useCallback } from 'react';
import BalanceCard from '@/components/BalanceCard';
import BalanceTable from '@/components/BalanceTable';
import TransactionList from '@/components/TransactionList';
import QuickActions from '@/components/QuickActions';
import DashboardHeader from '@/components/DashboardHeader';
import { Transaction } from '@/services/transactionService';
import { useToast } from '@/hooks/use-toast';

interface RevisedDashboardContentProps {
  balances: Record<string, number>;
  transactions: Transaction[];
  onRefresh: () => void;
}

const RevisedDashboardContent = ({ 
  balances = {}, 
  transactions = [], 
  onRefresh 
}: RevisedDashboardContentProps) => {
  const { toast } = useToast();
  
  // Create default balances for all expected currencies
  const defaultBalances = {
    USD: 0,
    EUR: 0,
    BTC: 0,
    ETH: 0,
    ...balances
  };
  
  const handleRefresh = useCallback(() => {
    toast({
      title: "Refreshing data",
      description: "Fetching your latest account information"
    });
    
    onRefresh();
  }, [onRefresh, toast]);

  return (
    <div className="space-y-8">
      <DashboardHeader onRefresh={handleRefresh} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BalanceCard 
          className="lg:col-span-2" 
          balances={defaultBalances}
        />
        
        <QuickActions />
        
        <BalanceTable 
          balances={defaultBalances}
          className="lg:col-span-3"
        />
        
        <TransactionList 
          transactions={transactions}
          className="lg:col-span-3"
        />
      </div>
    </div>
  );
};

export default RevisedDashboardContent;
