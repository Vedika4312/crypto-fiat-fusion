
import { supabase } from '@/integrations/supabase/client';

interface FundOperation {
  userId: string;
  amount: number;
  currency: string;
  description?: string;
}

// Function to check if current user is an admin
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // For simplicity, we're using a hardcoded admin email check
    // In a production app, you would have an admin role in a separate table
    return user.email === 'admin@fusionpay.com';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Function to add funds to a user's balance
export const addFunds = async (operationData: FundOperation) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    // Create a transaction record that adds funds to the user
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: 'receive',
        status: 'completed',
        amount: operationData.amount,
        currency: operationData.currency,
        is_crypto: false,
        recipient_id: operationData.userId,
        sender_id: user.id, // Admin is the sender
        user_id: operationData.userId, // Transaction belongs to recipient
        description: operationData.description || 'Admin deposit',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error adding funds:', error);
    return { data: null, error };
  }
};

// Function to withdraw funds from a user's balance
export const withdrawFunds = async (operationData: FundOperation) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    // First check if user has sufficient balance
    const { data: balances } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', operationData.userId)
      .eq('currency', operationData.currency)
      .single();
    
    if (!balances || Number(balances.balance) < operationData.amount) {
      throw new Error('Insufficient balance');
    }
    
    // Create a transaction record that withdraws funds from the user
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: 'send',
        status: 'completed',
        amount: operationData.amount,
        currency: operationData.currency,
        is_crypto: false,
        recipient_id: user.id, // Admin is the recipient
        sender_id: operationData.userId,
        user_id: operationData.userId, // Transaction belongs to sender
        description: operationData.description || 'Admin withdrawal',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    return { data: null, error };
  }
};

// Function to get all users
export const getAllUsers = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    // Get all users and their balances
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    return { data: users, error: null };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: null, error };
  }
};

// Function to get all balances for all users
export const getAllBalances = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');
    
    const { data, error } = await supabase
      .from('user_balances')
      .select('*');
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching balances:', error);
    return { data: null, error };
  }
};
