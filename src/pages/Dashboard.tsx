
import Navbar from '@/components/Navbar';
import BalanceCard from '@/components/BalanceCard';
import BalanceTable from '@/components/BalanceTable';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownToLine, ArrowUpToLine, RefreshCw, CreditCard, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Control initial loading to prevent flash
  useEffect(() => {
    if (!loading) {
      // Add a small delay to ensure content is properly loaded
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show a loading spinner while initially loading
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16 animate-fade-in">
          <div className="container app-container">
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-medium text-muted-foreground">Loading your dashboard...</h2>
            </div>
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
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Skeleton className="h-8 w-24" />
            </div>
            <p className="text-muted-foreground mb-8">Welcome back to your Fusion Pay account</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance Card Skeleton */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <CardHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-medium">Your Balance</CardTitle>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-2/3" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Actions Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
              
              {/* Balance Table Skeleton */}
              <Card className="lg:col-span-3 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-medium">Balance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
              
              {/* Transaction History Skeleton */}
              <Card className="lg:col-span-3 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-medium">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-80 w-full" />
                </CardContent>
              </Card>
            </div>
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
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refetch()} 
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground mb-8">Welcome back to your Fusion Pay account</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <BalanceCard 
              className="lg:col-span-2" 
              balances={balances}
              isLoading={false}
            />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild className="justify-start">
                  <Link to="/send">
                    <ArrowUpToLine className="mr-2 h-4 w-4" />
                    Send Money
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/receive">
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Receive Money
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/convert">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Convert Currency
                  </Link>
                </Button>

                <Button asChild variant="outline" className="justify-start">
                  <Link to="/virtual-card">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Virtual Cards
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
