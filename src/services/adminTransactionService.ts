
import { supabase } from '@/integrations/supabase/client';
import { updateUserBalance } from './balanceService';

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
