
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardLoadingSpinner from '@/components/DashboardLoadingSpinner';
import DashboardErrorBoundary from '@/components/DashboardErrorBoundary';
import { useTransactions } from '@/hooks/useTransactions';
import { Toaster } from '@/components/ui/toaster';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();
  
  useEffect(() => {
    console.log("Dashboard rendering, loading state:", loading);
    console.log("Transactions available:", transactions?.length);
  }, [loading, transactions]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <main className="pt-24 pb-16">
        <div className="container">
          <DashboardErrorBoundary>
            {loading ? (
              <DashboardLoadingSpinner />
            ) : (
              <>
                <DashboardHeader onRefresh={refetch} />
                <DashboardContent 
                  transactions={transactions || []} 
                  balances={balances || {}} 
                />
              </>
            )}
          </DashboardErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
