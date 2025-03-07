
import Navbar from '@/components/Navbar';
import BalanceCard from '@/components/BalanceCard';
import BalanceTable from '@/components/BalanceTable';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownToLine, ArrowUpToLine, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';

const Dashboard = () => {
  const { transactions, balances, loading } = useTransactions();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back to your Fusion Pay account</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <BalanceCard 
              className="lg:col-span-2" 
              balances={balances}
              isLoading={loading}
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
              </CardContent>
            </Card>
            
            {/* Balance Table - Added new component */}
            <BalanceTable 
              balances={balances}
              isLoading={loading}
              className="lg:col-span-3"
            />
            
            {/* Transaction History */}
            <TransactionList 
              transactions={transactions} 
              isLoading={loading}
              className="lg:col-span-3"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
