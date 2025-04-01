
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useVirtualCards } from '@/hooks/useVirtualCards';
import { transferToOtherCard } from '@/services/cardService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatCurrency';

const formSchema = z.object({
  recipient_card_number: z.string().length(16, { message: 'Card number must be 16 digits' }),
  amount: z.coerce.number().positive({ message: 'Amount must be greater than 0' }),
  description: z.string().optional(),
});

interface CardTransferFormProps {
  cardId: string;
  onSuccess?: () => void;
}

const CardTransferForm = ({ cardId, onSuccess }: CardTransferFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cards, refetch: refetchCards } = useVirtualCards();
  const { toast } = useToast();
  
  // Find selected card
  const selectedCard = cards.find(card => card.id === cardId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient_card_number: '',
      amount: undefined,
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (!selectedCard) {
        throw new Error('Source card not found');
      }
      
      // Check if card has sufficient balance
      if (selectedCard.balance < values.amount) {
        throw new Error(`Insufficient card balance. Available: ${formatCurrency(selectedCard.balance, selectedCard.currency)}`);
      }
      
      const { data, error } = await transferToOtherCard({
        card_id: cardId,
        recipient_card_number: values.recipient_card_number,
        amount: values.amount,
        description: values.description || 'Card transfer'
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Transfer Successful",
        description: `${formatCurrency(values.amount, selectedCard.currency)} has been sent to the recipient's card`,
        variant: "default",
      });
      
      form.reset();
      
      // Refresh data
      refetchCards();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error processing transfer:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || 'Please try again later',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="recipient_card_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Card Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="1234 5678 9012 3456" 
                  maxLength={16}
                  {...field} 
                  onChange={(e) => {
                    // Remove spaces if user pastes a card number with spaces
                    const value = e.target.value.replace(/\s/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter the 16-digit card number of the recipient
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
                    {selectedCard?.currency === 'USD' ? '$' : 
                     selectedCard?.currency === 'EUR' ? '€' : 
                     selectedCard?.currency === 'BTC' ? '₿' : 'Ξ'}
                  </div>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01" 
                    className="pl-7" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormDescription>
                Available: {selectedCard ? formatCurrency(selectedCard.balance, selectedCard.currency) : '0.00'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="What's this transfer for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Processing...
            </div>
          ) : (
            "Send to Card"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CardTransferForm;
