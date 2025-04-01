
import Navbar from '@/components/Navbar';
import BalanceCard from '@/components/BalanceCard';
import BalanceTable from '@/components/BalanceTable';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownToLine, ArrowUpToLine, RefreshCw, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { transactions, balances, loading, refetch } = useTransactions();

  // Page level loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16 animate-fade-in">
          <div className="container app-container">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground mb-8">Loading your Fusion Pay account...</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance Card Skeleton */}
              <div className="lg:col-span-2">
                <Skeleton className="h-[200px] w-full" />
              </div>
              
              {/* Quick Actions Skeleton */}
              <Skeleton className="h-[200px] w-full" />
              
              {/* Balance Table Skeleton */}
              <Skeleton className="h-[300px] w-full lg:col-span-3" />
              
              {/* Transaction History Skeleton */}
              <Skeleton className="h-[400px] w-full lg:col-span-3" />
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
