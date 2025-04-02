
import { supabase } from '@/integrations/supabase/client';
import { UserBalance } from './types/transactionTypes';

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
