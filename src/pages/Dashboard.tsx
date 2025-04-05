
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardSkeletonLoader from '@/components/DashboardSkeletonLoader';
import DashboardErrorBoundary from '@/components/DashboardErrorBoundary';
import { useTransactions } from '@/hooks/useTransactions';
import { Toaster } from '@/components/ui/toaster';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();
  
  // Simple effect to log render state for debugging
  useEffect(() => {
    console.log("Dashboard rendering, loading state:", loading);
    console.log("Transactions available:", transactions?.length);
  }, [loading, transactions]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <main className="pt-24 pb-16">
        <div className="container app-container">
          <DashboardErrorBoundary>
            {loading ? (
              // When loading, show skeleton
              <DashboardSkeletonLoader />
            ) : (
              // When loaded, show content
              <div>
                <DashboardHeader onRefresh={refetch} />
                <DashboardContent 
                  transactions={transactions} 
                  balances={balances} 
                />
              </div>
            )}
          </DashboardErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
