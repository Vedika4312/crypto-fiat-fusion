
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
  const [isVisible, setIsVisible] = useState(false);
  
  // Control initial loading to prevent flash
  useEffect(() => {
    // Set initial state
    if (!loading) {
      // Add a small delay before showing content to ensure smooth transition
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
        setIsVisible(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show a loading spinner while initially loading
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
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
        
        <main className="pt-24 pb-16">
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
      
      <main className="pt-24 pb-16">
        <div className={`container app-container transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
