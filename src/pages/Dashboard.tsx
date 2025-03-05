import { useState } from 'react';
import Navbar from '@/components/Navbar';
import BalanceCard from '@/components/BalanceCard';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownToLine, ArrowUpToLine, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock transaction data with proper type assertions
  const [transactions] = useState([
    {
      id: '1',
      type: 'receive' as const,
      status: 'completed' as const,
      amount: 250.0,
      currency: 'USD',
      isCrypto: false,
      sender: 'John D.',
      date: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: '2',
      type: 'send' as const,
      status: 'completed' as const,
      amount: 0.002,
      currency: 'BTC',
      isCrypto: true,
      recipient: 'Linda M.',
      date: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: '3',
      type: 'convert' as const,
      status: 'completed' as const,
      amount: 100.0,
      currency: 'USD',
      isCrypto: false,
      description: 'USD to BTC',
      date: new Date(Date.now() - 172800000), // 2 days ago
    },
    {
      id: '4',
      type: 'receive' as const,
      status: 'pending' as const,
      amount: 0.05,
      currency: 'ETH',
      isCrypto: true,
      sender: 'Crypto Exchange',
      date: new Date(Date.now() - 259200000), // 3 days ago
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back to your Fusion Pay account</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <BalanceCard className="lg:col-span-2" />
            
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
            
            {/* Transaction History */}
            <TransactionList 
              transactions={transactions} 
              className="lg:col-span-3"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
