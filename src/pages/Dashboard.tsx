
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardContent from '@/components/DashboardContent';
import { useTransactions } from '@/hooks/useTransactions';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();
  
  useEffect(() => {
    console.log("Dashboard rendering with:", {
      loading,
      transactionsCount: transactions?.length,
      balancesKeys: balances ? Object.keys(balances) : []
    });
  }, [loading, transactions, balances]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <main className="pt-24 pb-16">
        <div className="container">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
            </div>
          ) : (
            <DashboardContent 
              transactions={transactions || []} 
              balances={balances || {}}
              onRefresh={refetch} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
