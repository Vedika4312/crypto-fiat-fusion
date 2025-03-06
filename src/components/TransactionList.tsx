
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatCrypto } from '@/utils/formatCurrency';
import { ArrowDown, ArrowUp, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction } from '@/services/transactionService';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  className?: string;
}

const TransactionList = ({ transactions, isLoading = false, className }: TransactionListProps) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-20 bg-muted/50 rounded mt-2"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-20 bg-muted rounded"></div>
                  <div className="h-4 w-16 bg-muted/50 rounded mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
            <p>No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'receive':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'convert':
        return <RefreshCw className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Failed</Badge>;
    }
  };

  const formatTransactionAmount = (transaction: Transaction) => {
    const prefix = transaction.type === 'send' ? '-' : transaction.type === 'receive' ? '+' : '';
    const formattedAmount = transaction.is_crypto
      ? formatCrypto(Number(transaction.amount), transaction.currency)
      : formatCurrency(Number(transaction.amount), transaction.currency);
    
    return `${prefix}${formattedAmount}`;
  };

  const formatTransactionDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.type === 'send') {
      return 'Sent to User';
    } else if (transaction.type === 'receive') {
      return 'Received from User';
    } else {
      return transaction.description || 'Converted currency';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-medium">
                    {getTransactionDescription(transaction)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTransactionDate(transaction.created_at)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "font-medium",
                  transaction.type === 'send' ? 'text-red-500' : 
                  transaction.type === 'receive' ? 'text-green-500' : '',
                )}>
                  {formatTransactionAmount(transaction)}
                </div>
                <div className="mt-1">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
