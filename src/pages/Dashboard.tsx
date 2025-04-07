
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardErrorBoundary from '@/components/DashboardErrorBoundary';
import DashboardLoadingSpinner from '@/components/DashboardLoadingSpinner';
import RevisedDashboardContent from '@/components/RevisedDashboardContent';
import { useTransactions } from '@/hooks/useTransactions';
import { Toaster } from '@/components/ui/toaster';

const Dashboard = () => {
  const { transactions, balances, loading, error, refetch } = useTransactions();
  
  useEffect(() => {
    console.log("Dashboard mounted with state:", {
      loading,
      hasTransactions: transactions?.length > 0,
      hasBalances: balances && Object.keys(balances).length > 0,
      error: error ? "Error occurred" : "No error"
    });
  }, [transactions, balances, loading, error]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <main className="pt-20 pb-16">
        <div className="container px-4">
          <DashboardErrorBoundary>
            {loading ? (
              <DashboardLoadingSpinner />
            ) : (
              <RevisedDashboardContent 
                transactions={transactions || []} 
                balances={balances || {}}
                onRefresh={refetch} 
              />
            )}
          </DashboardErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
