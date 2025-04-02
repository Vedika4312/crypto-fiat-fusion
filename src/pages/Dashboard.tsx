
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardLoadingSpinner from '@/components/DashboardLoadingSpinner';
import { useTransactions } from '@/hooks/useTransactions';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Show dashboard content when data is loaded
    if (!loading) {
      // Add a short delay for smoother transition
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container app-container">
          {!isReady ? (
            <DashboardLoadingSpinner />
          ) : (
            <div className="animate-fadeIn">
              <DashboardHeader onRefresh={refetch} />
              <DashboardContent 
                transactions={transactions} 
                balances={balances} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
