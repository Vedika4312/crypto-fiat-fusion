
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Transaction, 
  getTransactions, 
  getUserBalances,
  subscribeToTransactions,
  updateUserBalance
} from '@/services/transactionService';
import { useToast } from '@/hooks/use-toast';

interface UserBalance {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  last_updated: Date;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch transactions and balances
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getTransactions(),
        getUserBalances()
      ]);
      
      if (transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
      
      if (balancesResponse.data) {
        // Convert balance array to a record for easier access
        const balanceRecord: Record<string, number> = {};
        balancesResponse.data.forEach((balance: UserBalance) => {
          balanceRecord[balance.currency] = Number(balance.balance);
        });
        
        setBalances(balanceRecord);
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToTransactions((transaction) => {
      // Check if the transaction is related to the current user
      if (transaction.user_id === user.id || 
          transaction.recipient_id === user.id || 
          transaction.sender_id === user.id) {
        
        // Update the list of transactions
        setTransactions(prevTransactions => {
          // Check if the transaction is already in the list
          const exists = prevTransactions.some(t => t.id === transaction.id);
          if (exists) return prevTransactions;
          
          // Format dates
          const formattedTransaction = {
            ...transaction,
            created_at: new Date(transaction.created_at),
            updated_at: new Date(transaction.updated_at)
          };
          
          // Add the new transaction at the beginning
          return [formattedTransaction, ...prevTransactions];
        });
        
        // Show a toast notification for new transactions
        if (transaction.type === 'receive' && transaction.user_id === user.id) {
          toast({
            title: "Payment Received!",
            description: `You received ${transaction.amount} ${transaction.currency}`,
          });
        } else if (transaction.type === 'admin_deposit' && transaction.user_id === user.id) {
          toast({
            title: "Funds Added!",
            description: `${transaction.amount} ${transaction.currency} was added to your account`,
          });
        } else if (transaction.type === 'admin_withdrawal' && transaction.user_id === user.id) {
          toast({
            title: "Funds Withdrawn!",
            description: `${transaction.amount} ${transaction.currency} was withdrawn from your account`,
          });
        }
        
        // Refresh balances after a new transaction
        getUserBalances().then(response => {
          if (response.data) {
            const balanceRecord: Record<string, number> = {};
            response.data.forEach((balance: UserBalance) => {
              balanceRecord[balance.currency] = Number(balance.balance);
            });
            setBalances(balanceRecord);
          }
        });
      }
    });
    
    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [user, toast]);

  return {
    transactions,
    balances,
    loading,
    refetch: async () => {
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getTransactions(),
        getUserBalances()
      ]);
      
      if (transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
      
      if (balancesResponse.data) {
        const balanceRecord: Record<string, number> = {};
        balancesResponse.data.forEach((balance: UserBalance) => {
          balanceRecord[balance.currency] = Number(balance.balance);
        });
        
        setBalances(balanceRecord);
      }
    }
  };
}
