
import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionPayload } from './types/transactionTypes';

// Re-export types and other services for backward compatibility
export type { Transaction, TransactionPayload, UserBalance } from './types/transactionTypes';
export { getUserBalances, updateUserBalance } from './balanceService';
export { subscribeToTransactions } from './transactionSubscriptionService';
export { adminAddFunds, adminWithdrawFunds } from './adminTransactionService';

// Function to send payment
export const sendPayment = async (transactionData: TransactionPayload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Instead of directly using the RPC function with TypeScript checking,
    // we'll use the raw function call approach which bypasses strict typing
    const { data: transaction, error: transactionError } = await supabase.functions.invoke(
      'create-transaction',
      {
        body: {
          sender_id: user.id,
          recipient_id: transactionData.recipient_id,
          amount: transactionData.amount,
          currency: transactionData.currency,
          is_crypto: transactionData.is_crypto,
          description: transactionData.description || 'Payment'
        }
      }
    );
    
    if (transactionError) throw transactionError;
    
    return { data: transaction, error: null };
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
