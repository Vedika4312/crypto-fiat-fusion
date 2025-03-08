
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'convert' | 'admin_deposit' | 'admin_withdrawal';
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

export interface UserBalance {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  last_updated: Date;
}

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

// Function to get user balances from the new user_balances table
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

// Helper function to update a user's balance
export const updateUserBalance = async (userId: string, currency: string, amount: number) => {
  try {
    // First, check if the balance exists
    const { data: existingBalance, error: fetchError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (existingBalance) {
      // Update existing balance
      const newBalance = Number(existingBalance.balance) + amount;
      
      // Prevent negative balances
      if (newBalance < 0) throw new Error('Insufficient balance');
      
      const { error: updateError } = await supabase
        .from('user_balances')
        .update({ 
          balance: newBalance,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingBalance.id);
      
      if (updateError) throw updateError;
    } else {
      // Create new balance record - only allow positive initial balances
      if (amount < 0) throw new Error('Cannot create negative balance');
      
      const { error: insertError } = await supabase
        .from('user_balances')
        .insert({
          user_id: userId,
          currency: currency,
          balance: amount,
          last_updated: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating balance:', error);
    return { success: false, error };
  }
};

// Function to subscribe to transaction updates
export const subscribeToTransactions = (callback: (transaction: Transaction) => void) => {
  // Get the current session synchronously
  const { data: sessionData } = supabase.auth.getSession();
  
  // Extract user from session if it exists
  const user = sessionData.session?.user;
  
  if (!user) {
    console.error('User not authenticated for transaction subscription');
    return () => {};
  }
  
  const userId = user.id;
  
  const channel = supabase
    .channel('public:transactions')
    .on('postgres_changes', 
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
      },
      (payload) => {
        // Convert the payload to a Transaction object
        const transaction = {
          ...payload.new as Transaction,
          created_at: new Date(payload.new.created_at),
          updated_at: new Date(payload.new.updated_at),
        };
        
        // Only process transactions related to the current user
        if (
          transaction.user_id === userId || 
          transaction.recipient_id === userId || 
          transaction.sender_id === userId
        ) {
          callback(transaction);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Admin function to adjust user balance (add or withdraw funds)
export const adminAdjustBalance = async (
  userId: string,
  amount: number,
  currency: string,
  is_crypto: boolean = false,
  type: 'admin_deposit' | 'admin_withdrawal',
  description: string = ''
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type,
        status: 'completed',
        amount: Math.abs(amount),
        currency,
        is_crypto,
        user_id: userId,
        sender_id: type === 'admin_withdrawal' ? userId : user.id,
        recipient_id: type === 'admin_deposit' ? userId : user.id,
        description: description || `Admin ${type === 'admin_deposit' ? 'deposit' : 'withdrawal'}`
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update user balance
    const balanceChange = type === 'admin_deposit' ? Math.abs(amount) : -Math.abs(amount);
    await updateUserBalance(userId, currency, balanceChange);
    
    // Get the updated balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();
    
    if (balanceError) throw balanceError;
    
    return { 
      transaction: data, 
      balance: balanceData?.balance,
      error: null 
    };
  } catch (error) {
    console.error(`Error during admin ${type}:`, error);
    return { transaction: null, balance: null, error };
  }
};

// Admin function to add funds to a user's balance
export const adminAddFunds = async (
  userId: string,
  amount: number,
  currency: string,
  is_crypto: boolean = false,
  description: string = ''
) => {
  return adminAdjustBalance(
    userId,
    Math.abs(amount),
    currency,
    is_crypto,
    'admin_deposit',
    description || 'Admin deposit'
  );
};

// Admin function to withdraw funds from a user's balance
export const adminWithdrawFunds = async (
  userId: string,
  amount: number,
  currency: string,
  is_crypto: boolean = false,
  description: string = ''
) => {
  return adminAdjustBalance(
    userId,
    Math.abs(amount),
    currency,
    is_crypto,
    'admin_withdrawal',
    description || 'Admin withdrawal'
  );
};
