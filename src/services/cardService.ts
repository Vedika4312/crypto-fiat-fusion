import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/services/transactionService';

export interface VirtualCard {
  id: string;
  user_id: string;
  name: string;
  card_number: string;
  cvv: string;
  expiry_date: string;
  balance: number;
  currency: string;
  active: boolean;
  created_at: string;
  transactions?: Transaction[];
}

interface CreateCardPayload {
  name: string;
  currency: string;
}

interface FundCardPayload {
  card_id: string;
  amount: number;
  currency: string;
}

interface TransferToCardPayload {
  card_id: string;
  recipient_card_number: string;
  amount: number;
  description?: string;
}

// Function to create a virtual card
export const createVirtualCard = async (cardData: CreateCardPayload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Call the create-virtual-card edge function
    const { data, error } = await supabase.functions.invoke('create-virtual-card', {
      body: {
        name: cardData.name,
        currency: cardData.currency
      }
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating virtual card:', error);
    return { data: null, error };
  }
};

// Function to fund a virtual card
export const fundVirtualCard = async (fundData: FundCardPayload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Call the fund-virtual-card edge function
    const { data, error } = await supabase.functions.invoke('fund-virtual-card', {
      body: {
        card_id: fundData.card_id,
        amount: fundData.amount,
        currency: fundData.currency,
        direction: 'account_to_card'
      }
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error funding virtual card:', error);
    return { data: null, error };
  }
};

// Function to withdraw from a virtual card to account
export const withdrawFromVirtualCard = async (withdrawData: FundCardPayload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Call the fund-virtual-card edge function with direction card_to_account
    const { data, error } = await supabase.functions.invoke('fund-virtual-card', {
      body: {
        card_id: withdrawData.card_id,
        amount: withdrawData.amount,
        currency: withdrawData.currency,
        direction: 'card_to_account'
      }
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error withdrawing from virtual card:', error);
    return { data: null, error };
  }
};

// Function to transfer funds to another user's card
export const transferToOtherCard = async (transferData: TransferToCardPayload) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Call the card-to-card-transfer edge function
    const { data, error } = await supabase.functions.invoke('card-to-card-transfer', {
      body: {
        card_id: transferData.card_id,
        recipient_card_number: transferData.recipient_card_number,
        amount: transferData.amount,
        description: transferData.description || 'Card transfer'
      }
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error transferring to other card:', error);
    return { data: null, error };
  }
};

// Function to get user's virtual cards
export const getVirtualCards = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Use generic fetch with the supabase client and proper type assertions
    // First cast to unknown, then to the expected type
    const { data: cardsData, error: cardsError } = await supabase
      .from('virtual_cards' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (cardsError) throw cardsError;
    
    // If no cards, return empty array
    if (!cardsData || cardsData.length === 0) {
      return { data: [], error: null };
    }
    
    // Safely convert to VirtualCard[] with intermediate unknown cast
    const typedCardsData = (cardsData as unknown) as VirtualCard[];
    
    // Separately fetch transactions for each card
    const cardsWithTransactions = await Promise.all(
      typedCardsData.map(async (card) => {
        const { data: txData, error: txError } = await supabase
          .from('card_transactions' as any)
          .select('*')
          .eq('card_id', card.id)
          .order('created_at', { ascending: false });
        
        return {
          ...card,
          transactions: txError || !txData ? [] : ((txData as unknown) as Transaction[]).sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        };
      })
    );
    
    return { data: cardsWithTransactions, error: null };
  } catch (error) {
    console.error('Error fetching virtual cards:', error);
    return { data: null, error };
  }
};

// Function to subscribe to card transaction updates
export const subscribeToCardTransactions = (callback: (cardId: string) => void) => {
  try {
    // Get the current user ID asynchronously
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id;
      
      if (!userId) {
        console.error('User not authenticated for card transaction subscription');
        return;
      }
      
      const channel = supabase
        .channel('card-transactions')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'card_transactions',
          },
          (payload) => {
            // Use type safety with unknown payload
            if (payload && 
                typeof payload === 'object' && 
                'new' in payload && 
                payload.new && 
                typeof payload.new === 'object' && 
                'card_id' in payload.new && 
                typeof payload.new.card_id === 'string') {
              
              const cardId = payload.new.card_id;
              
              // Call the callback with the card ID
              if (cardId) {
                callback(cardId);
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    });
    
    // Return empty function as placeholder
    return () => {};
  } catch (error) {
    console.error('Error setting up card transaction subscription:', error);
    return () => {};
  }
};
