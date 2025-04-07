
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
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Helper function to update balances from API response
  const processBalancesData = useCallback((data: UserBalance[]) => {
    if (!Array.isArray(data)) {
      console.error("Invalid balance data format", data);
      return {};
    }
    
    const balanceRecord: Record<string, number> = {};
    data.forEach((balance: UserBalance) => {
      if (balance && balance.currency) {
        balanceRecord[balance.currency] = Number(balance.balance) || 0;
      }
    });
    
    // Ensure all expected currencies exist with default values
    const supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];
    supportedCurrencies.forEach(currency => {
      if (balanceRecord[currency] === undefined) {
        balanceRecord[currency] = 0;
      }
    });
    
    return balanceRecord;
  }, []);

  // Function to fetch data
  const fetchData = useCallback(async () => {
    console.log("Fetching transaction data for user:", user?.id);
    setLoading(true);
    setError(null);
    
    try {
      if (!user) {
        console.log("No authenticated user found");
        setTransactions([]);
        setBalances({});
        setLoading(false);
        return;
      }
      
      // Using Promise.all to fetch data concurrently
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getTransactions(),
        getUserBalances()
      ]);
      
      // Process transactions
      if (transactionsResponse.error) {
        console.error("Error fetching transactions:", transactionsResponse.error);
        setError(new Error(transactionsResponse.error.message || 'Failed to load transactions'));
        toast({
          title: "Failed to load transactions",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } else {
        const userTransactions = Array.isArray(transactionsResponse.data) 
          ? transactionsResponse.data
          : [];
          
        console.log(`Found ${userTransactions.length} transactions`);
        setTransactions(userTransactions);
      }
      
      // Process balances
      if (balancesResponse.error) {
        console.error("Error fetching balances:", balancesResponse.error);
      } else {
        const balanceData = processBalancesData(balancesResponse.data || []);
        console.log("Processed balance data:", balanceData);
        setBalances(balanceData);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast({
        title: "Failed to load data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, processBalancesData]);

  // Initial data fetch
  useEffect(() => {
    console.log("Initial data fetch triggered, user:", user?.id);
    fetchData();
  }, [fetchData, user]);

  // Subscribe to transaction updates
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up transaction subscription for user:", user.id);
    const unsubscribe = subscribeToTransactions((transaction) => {
      console.log("Real-time transaction received:", transaction.id);
      
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
        
        // Refresh balances after receiving payment
        getUserBalances().then(response => {
          if (response.data) {
            const updatedBalances = processBalancesData(response.data);
            setBalances(updatedBalances);
          }
        });
      } else if (transaction.type === 'send' && transaction.sender_id === user.id) {
        // Refresh balances after sending payment
        getUserBalances().then(response => {
          if (response.data) {
            const updatedBalances = processBalancesData(response.data);
            setBalances(updatedBalances);
          }
        });
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up transaction subscription");
      unsubscribe();
    };
  }, [user, toast, processBalancesData]);

  return {
    transactions,
    balances,
    loading,
    error,
    refetch: fetchData
  };
}
