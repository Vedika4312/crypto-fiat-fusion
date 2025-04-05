
import { useState, useEffect } from 'react';
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
  const fetchData = async () => {
    console.log("Starting data fetch, user:", user?.id);
    setLoading(true);
    
    try {
      // Default empty states if no user
      if (!user) {
        console.log("No user found, using default values");
        setTransactions([]);
        setBalances({
          USD: 0,
          EUR: 0,
          BTC: 0,
          ETH: 0
        });
        return;
      }
      
      console.log("Fetching transaction data for user:", user.id);
      
      // Using Promise.all to fetch data concurrently
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getTransactions(),
        getUserBalances()
      ]);
      
      // Process transactions
      if (transactionsResponse.data) {
        const userTransactions = transactionsResponse.data.filter(transaction => 
          transaction.user_id === user.id || 
          transaction.recipient_id === user.id || 
          transaction.sender_id === user.id
        );
        console.log(`Found ${userTransactions.length} transactions`);
        setTransactions(userTransactions);
      } else {
        console.log("No transactions found or error occurred");
        setTransactions([]);
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
      } else {
        console.log("No balance data found or error occurred");
        setBalances({
          USD: 0,
          EUR: 0,
          BTC: 0,
          ETH: 0
        });
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      // Set default values if there's an error
      setTransactions([]);
      setBalances({
        USD: 0,
        EUR: 0,
        BTC: 0,
        ETH: 0
      });
      
      toast({
        title: "Failed to load data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      console.log("Finished data fetch, setting loading to false");
      setLoading(false);
    }
  };

  // Fetch data on mount or when user changes
  useEffect(() => {
    console.log("useTransactions effect triggered, current user:", user?.id);
    fetchData();
    // We don't include toast in the dependency array as it's unlikely to change
    // and may cause unnecessary refetches
  }, [user]);

  // Subscribe to transaction updates
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up transaction subscription for user:", user.id);
    const unsubscribe = subscribeToTransactions((transaction) => {
      if (transaction.user_id === user.id || 
          transaction.recipient_id === user.id || 
          transaction.sender_id === user.id) {
        
        setTransactions(prevTransactions => {
          const exists = prevTransactions.some(t => t.id === transaction.id);
          if (exists) return prevTransactions;
          
          return [transaction, ...prevTransactions];
        });
        
        if (transaction.type === 'receive' && transaction.recipient_id === user.id) {
          toast({
            title: "Payment Received!",
            description: `You received ${transaction.amount} ${transaction.currency}`,
            variant: "default",
          });
          
          // Update balances after receiving payment
          getUserBalances().then(response => {
            if (response.data) {
              const balanceRecord: Record<string, number> = {};
              response.data.forEach((balance: UserBalance) => {
                balanceRecord[balance.currency] = Number(balance.balance);
              });
              
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
          // Update balances after sending payment
          getUserBalances().then(response => {
            if (response.data) {
              const balanceRecord: Record<string, number> = {};
              response.data.forEach((balance: UserBalance) => {
                balanceRecord[balance.currency] = Number(balance.balance);
              });
              
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
