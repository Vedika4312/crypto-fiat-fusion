
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardLoadingSpinner from '@/components/DashboardLoadingSpinner';
import DashboardSkeletonLoader from '@/components/DashboardSkeletonLoader';
import { useTransactions } from '@/hooks/useTransactions';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Control initial loading to prevent flash
  useEffect(() => {
    // Set a timeout to make sure we don't show loading state for very quick responses
    const initialLoadTimeout = setTimeout(() => {
      if (!loading) {
        setIsInitialLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(initialLoadTimeout);
  }, [loading]);

  // Show a loading spinner while initially loading
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16 animate-fade-in">
          <div className="container app-container">
            <DashboardLoadingSpinner />
          </div>
        </main>
      </div>
    );
  }

  // Skeleton loading state for when data is fetching but not on initial load
  if (loading && !isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16 animate-fade-in">
          <div className="container app-container">
            <DashboardSkeletonLoader />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <DashboardHeader onRefresh={refetch} />
          <DashboardContent 
            transactions={transactions} 
            balances={balances} 
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
