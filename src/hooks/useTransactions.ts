import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Transaction, 
  getTransactions, 
  getUserBalances,
  subscribeToTransactions
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

  // Function to fetch data
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getTransactions(),
        getUserBalances()
      ]);
      
      if (transactionsResponse.data) {
        // Filter transactions to only show those related to the current user
        const userTransactions = transactionsResponse.data.filter(transaction => 
          transaction.user_id === user.id || 
          transaction.recipient_id === user.id || 
          transaction.sender_id === user.id
        );
        setTransactions(userTransactions);
      }
      
      if (balancesResponse.data) {
        // Convert balance array to a record for easier access
        const balanceRecord: Record<string, number> = {};
        balancesResponse.data.forEach((balance: UserBalance) => {
          balanceRecord[balance.currency] = Number(balance.balance);
        });
        
        // Ensure we have entries for all supported currencies
        const supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];
        supportedCurrencies.forEach(currency => {
          if (balanceRecord[currency] === undefined) {
            balanceRecord[currency] = 0;
          }
        });
        
        setBalances(balanceRecord);
      } else {
        // If no balances found, set defaults for all supported currencies
        setBalances({
          USD: 0,
          EUR: 0,
          BTC: 0,
          ETH: 0
        });
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      toast({
        title: "Failed to load data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      // Make sure loading is set to false no matter what happens
      setLoading(false);
    }
  };

  // Fetch transactions and balances
  useEffect(() => {
    // Set an initial timeout to handle very quick loading flashes
    const loadingTimeout = setTimeout(() => {
      fetchData();
    }, 300); // Short delay to prevent loading flash
    
    return () => clearTimeout(loadingTimeout);
  }, [user, toast]);

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
          
          // Add the new transaction at the beginning
          return [transaction, ...prevTransactions];
        });
        
        // Show a toast notification for new transactions
        if (transaction.type === 'receive' && transaction.recipient_id === user.id) {
          toast({
            title: "Payment Received!",
            description: `You received ${transaction.amount} ${transaction.currency}`,
            variant: "default",
          });
          
          // Refresh balances to show updated amount
          getUserBalances().then(response => {
            if (response.data) {
              const balanceRecord: Record<string, number> = {};
              response.data.forEach((balance: UserBalance) => {
                balanceRecord[balance.currency] = Number(balance.balance);
              });
              
              // Ensure all supported currencies exist
              const supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];
              supportedCurrencies.forEach(currency => {
                if (balanceRecord[currency] === undefined) {
                  balanceRecord[currency] = 0;
                }
              });
              
              setBalances(balanceRecord);
            }
          });
        } else if (transaction.type === 'send' && transaction.sender_id === user.id) {
          // We already show toast in send form, but refresh balances
          getUserBalances().then(response => {
            if (response.data) {
              const balanceRecord: Record<string, number> = {};
              response.data.forEach((balance: UserBalance) => {
                balanceRecord[balance.currency] = Number(balance.balance);
              });
              
              // Ensure all supported currencies exist
              const supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];
              supportedCurrencies.forEach(currency => {
                if (balanceRecord[currency] === undefined) {
                  balanceRecord[currency] = 0;
                }
              });
              
              setBalances(balanceRecord);
            }
          });
        }
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
    refetch: fetchData
  };
}
