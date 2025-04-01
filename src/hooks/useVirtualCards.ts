
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getVirtualCards, 
  VirtualCard as VirtualCardType,
  subscribeToCardTransactions
} from '@/services/cardService';
import { useToast } from '@/hooks/use-toast';

export interface VirtualCard extends VirtualCardType {}

export function useVirtualCards() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to fetch data
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await getVirtualCards();
      
      if (error) throw error;
      
      if (data) {
        setCards(data);
      }
    } catch (error) {
      console.error('Error fetching virtual cards:', error);
      toast({
        title: "Failed to load virtual cards",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch virtual cards
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      fetchData();
    }, 300);
    
    return () => clearTimeout(loadingTimeout);
  }, [user, toast]);

  // Subscribe to real-time updates for card transactions
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToCardTransactions((cardId) => {
      // Refresh the cards data when a transaction occurs
      fetchData();
      
      // Show a toast notification for card transactions
      const updatedCard = cards.find(card => card.id === cardId);
      if (updatedCard) {
        toast({
          title: "Card Transaction",
          description: `Your card "${updatedCard.name}" has been updated`,
          variant: "default",
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [user, cards, toast]);

  return {
    cards,
    loading,
    refetch: fetchData
  };
}
