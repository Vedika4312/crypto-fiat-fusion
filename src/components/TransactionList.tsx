
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatCrypto } from '@/utils/formatCurrency';
import { ArrowDown, ArrowUp, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'convert';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  currency: string;
  isCrypto: boolean;
  recipient?: string;
  sender?: string;
  date: Date;
  description?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  className?: string;
}

const TransactionList = ({ transactions, className }: TransactionListProps) => {
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
    const formattedAmount = transaction.isCrypto
      ? formatCrypto(transaction.amount, transaction.currency)
      : formatCurrency(transaction.amount, transaction.currency);
    
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
                    {transaction.type === 'send' && 'Sent to '}
                    {transaction.type === 'receive' && 'Received from '}
                    {transaction.type === 'convert' && 'Converted '}
                    {transaction.type === 'send' && transaction.recipient}
                    {transaction.type === 'receive' && transaction.sender}
                    {transaction.type === 'convert' && transaction.description}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTransactionDate(transaction.date)}
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
