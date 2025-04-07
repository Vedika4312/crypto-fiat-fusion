
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Transaction, 
  getTransactions, 
  getUserBalances,
  subscribeToTransactions,
  UserBalance
} from '@/services/transactionService';
import { useToast } from '@/hooks/use-toast';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({
    USD: 0,
    EUR: 0,
    BTC: 0,
    ETH: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to fetch data
  const fetchData = useCallback(async () => {
    console.log("Fetching transaction data, user:", user?.id);
    setLoading(true);
    
    try {
      if (!user) {
        console.log("No user found, using default values");
        setTransactions([]);
        return;
      }
      
      // Using Promise.all to fetch data concurrently
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getTransactions(),
        getUserBalances()
      ]);
      
      // Process transactions
      if (transactionsResponse.data) {
        console.log(`Found ${transactionsResponse.data.length} transactions`);
        setTransactions(transactionsResponse.data);
      } else if (transactionsResponse.error) {
        console.error("Error fetching transactions:", transactionsResponse.error);
        toast({
          title: "Failed to load transactions",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      }
      
      // Process balances
      if (balancesResponse.data) {
        const balanceRecord: Record<string, number> = {};
        balancesResponse.data.forEach((balance: UserBalance) => {
          balanceRecord[balance.currency] = Number(balance.balance);
        });
        
        // Ensure all expected currencies exist
        const supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];
        supportedCurrencies.forEach(currency => {
          if (balanceRecord[currency] === undefined) {
            balanceRecord[currency] = 0;
          }
        });
        
        console.log("Balance data:", balanceRecord);
        setBalances(balanceRecord);
      } else if (balancesResponse.error) {
        console.error("Error fetching balances:", balancesResponse.error);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: "Failed to load data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch data on mount or when user changes
  useEffect(() => {
    console.log("useTransactions effect triggered, current user:", user?.id);
    fetchData();
  }, [fetchData, user]);

  // Subscribe to transaction updates
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up transaction subscription for user:", user.id);
    const unsubscribe = subscribeToTransactions((transaction) => {
      console.log("New transaction received:", transaction.id);
      
      // Update transactions list
      setTransactions(prevTransactions => {
        // Check if transaction already exists in list
        const exists = prevTransactions.some(t => t.id === transaction.id);
        if (exists) return prevTransactions;
        
        // Add new transaction to the beginning of the list
        return [transaction, ...prevTransactions];
      });
      
      // Show toast notification for new transactions
      if (transaction.type === 'receive' && transaction.recipient_id === user.id) {
        toast({
          title: "Payment Received!",
          description: `You received ${transaction.amount} ${transaction.currency}`,
        });
        
        // Update balances after receiving payment
        getUserBalances().then(response => {
          if (response.data) {
            updateBalancesFromResponse(response.data);
          }
        });
      } else if (transaction.type === 'send' && transaction.sender_id === user.id) {
        // Update balances after sending payment
        getUserBalances().then(response => {
          if (response.data) {
            updateBalancesFromResponse(response.data);
          }
        });
      }
    });
    
    // Helper function to update balances from response
    const updateBalancesFromResponse = (data: UserBalance[]) => {
      const balanceRecord: Record<string, number> = {};
      data.forEach((balance: UserBalance) => {
        balanceRecord[balance.currency] = Number(balance.balance);
      });
      
      const supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];
      supportedCurrencies.forEach(currency => {
        if (balanceRecord[currency] === undefined) {
          balanceRecord[currency] = 0;
        }
      });
      
      setBalances(balanceRecord);
    };
    
    return () => {
      console.log("Cleaning up transaction subscription");
      unsubscribe();
    };
  }, [user, toast]);

  return {
    transactions,
    balances,
    loading,
    refetch: fetchData
  };
}
