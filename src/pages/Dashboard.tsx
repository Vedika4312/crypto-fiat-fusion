
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardContent from '@/components/DashboardContent';
import DashboardSkeletonLoader from '@/components/DashboardSkeletonLoader';
import { useTransactions } from '@/hooks/useTransactions';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container app-container">
          {loading ? (
            <DashboardSkeletonLoader />
          ) : (
            <div className="fade-in">
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
