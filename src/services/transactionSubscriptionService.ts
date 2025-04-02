
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from './types/transactionTypes';

// Function to subscribe to transaction updates
export const subscribeToTransactions = (callback: (transaction: Transaction) => void) => {
  let userId: string | undefined;
  
  try {
    // Get the current user ID asynchronously from the session
    supabase.auth.getSession().then(({ data }) => {
      userId = data.session?.user?.id;
      
      if (!userId) {
        console.error('User not authenticated for transaction subscription');
        return;
      }
      
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
    });
    
    // Return empty function as placeholder until the real unsubscribe function is available
    return () => {};
  } catch (error) {
    console.error('Error getting user session:', error);
    return () => {};
  }
};
