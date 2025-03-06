
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'convert';
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  currency: string;
  is_crypto: boolean;
  recipient_id?: string;
  sender_id?: string;
  user_id: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionPayload {
  recipient_id: string;
  amount: number;
  currency: string;
  is_crypto: boolean;
  description?: string;
}

// Function to send payment
export const sendPayment = async (transactionData: TransactionPayload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: 'send',
        status: 'completed',
        amount: transactionData.amount,
        currency: transactionData.currency,
        is_crypto: transactionData.is_crypto,
        recipient_id: transactionData.recipient_id,
        sender_id: user.id,
        user_id: user.id,
        description: transactionData.description,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create a corresponding "receive" transaction for the recipient
    const { error: receiveError } = await supabase
      .from('transactions')
      .insert({
        type: 'receive',
        status: 'completed',
        amount: transactionData.amount,
        currency: transactionData.currency,
        is_crypto: transactionData.is_crypto,
        recipient_id: transactionData.recipient_id,
        sender_id: user.id,
        user_id: transactionData.recipient_id,
        description: transactionData.description,
      });
    
    if (receiveError) throw receiveError;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error sending payment:', error);
    return { data: null, error };
  }
};

// Function to get user transactions
export const getTransactions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`user_id.eq.${user.id},recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert string dates to Date objects
    const formattedData = data.map(transaction => ({
      ...transaction,
      created_at: new Date(transaction.created_at),
      updated_at: new Date(transaction.updated_at),
    }));
    
    return { data: formattedData, error: null };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data: null, error };
  }
};

// Function to get user balances
export const getUserBalances = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching balances:', error);
    return { data: null, error };
  }
};

// Function to subscribe to transaction updates
export const subscribeToTransactions = (callback: (transaction: Transaction) => void) => {
  const channel = supabase
    .channel('public:transactions')
    .on('postgres_changes', 
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
      },
      (payload) => {
        // Only trigger callback if the transaction is related to the current user
        const transaction = payload.new as Transaction;
        callback(transaction);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
