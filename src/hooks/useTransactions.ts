
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
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) {
      // Set default empty states if no user
      setTransactions([]);
      setBalances({
        USD: 0,
        EUR: 0,
        BTC: 0,
        ETH: 0
      });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const startTime = Date.now();
      
      const [transactionsResponse, balancesResponse] = await Promise.all([
        getTransactions(),
        getUserBalances()
      ]);
      
      // Ensure minimum loading time for better UX
      const loadTime = Date.now() - startTime;
      if (loadTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - loadTime));
      }
      
      // Process transactions
      if (transactionsResponse.data) {
        const userTransactions = transactionsResponse.data.filter(transaction => 
          transaction.user_id === user.id || 
          transaction.recipient_id === user.id || 
          transaction.sender_id === user.id
        );
        setTransactions(userTransactions);
      } else {
        setTransactions([]);
      }
      
      // Process balances
      if (balancesResponse.data) {
        const balanceRecord: Record<string, number> = {};
        balancesResponse.data.forEach((balance: UserBalance) => {
          balanceRecord[balance.currency] = Number(balance.balance);
        });
        
        const supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];
        supportedCurrencies.forEach(currency => {
          if (balanceRecord[currency] === undefined) {
            balanceRecord[currency] = 0;
          }
        });
        
        setBalances(balanceRecord);
      } else {
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
      setLoading(false);
    }
  };

  // Fetch data on mount or when user changes
  useEffect(() => {
    fetchData();
  }, [user]);

  // Subscribe to transaction updates
  useEffect(() => {
    if (!user) return;
    
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
