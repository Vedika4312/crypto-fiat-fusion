
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { useVirtualCards } from '@/hooks/useVirtualCards';
import { fundVirtualCard, withdrawFromVirtualCard } from '@/services/cardService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatCurrency';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be greater than 0' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
});

interface FundCardFormProps {
  cardId: string;
  onSuccess?: () => void;
  transferToAccount?: boolean;
}

const FundCardForm = ({ cardId, onSuccess, transferToAccount = false }: FundCardFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { balances, refetch: refetchBalances } = useTransactions();
  const { cards, refetch: refetchCards } = useVirtualCards();
  const { toast } = useToast();
  
  // Find selected card
  const selectedCard = cards.find(card => card.id === cardId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      currency: selectedCard?.currency || 'USD',
    },
  });

  // Update currency when card changes
  useState(() => {
    if (selectedCard) {
      form.setValue('currency', selectedCard.currency);
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      let result;
      
      if (transferToAccount) {
        // Withdraw from card to account
        if (!selectedCard) {
          throw new Error('Card not found');
        }
        
        // Check if card has sufficient balance
        if (selectedCard.balance < values.amount) {
          throw new Error(`Insufficient card balance. Available: ${formatCurrency(selectedCard.balance, selectedCard.currency)}`);
        }
        
        result = await withdrawFromVirtualCard({
          card_id: cardId,
          amount: values.amount,
          currency: values.currency
        });
      } else {
        // Transfer from account to card
        // Check if account has sufficient balance
        const currentBalance = balances?.[values.currency] || 0;
        if (currentBalance < values.amount) {
          throw new Error(`Insufficient account balance. Available: ${formatCurrency(currentBalance, values.currency)}`);
        }
        
        result = await fundVirtualCard({
          card_id: cardId,
          amount: values.amount,
          currency: values.currency
        });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: transferToAccount 
          ? "Funds Transferred to Account" 
          : "Card Funded Successfully",
        description: `${formatCurrency(values.amount, values.currency)} has been ${transferToAccount ? 'transferred to your account' : 'added to your card'}`,
        variant: "default",
      });
      
      form.reset({
        amount: undefined,
        currency: selectedCard?.currency || 'USD',
      });
      
      // Refresh data
      refetchBalances();
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
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={selectedCard !== undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="BTC">Bitcoin (₿)</SelectItem>
                  <SelectItem value="ETH">Ethereum (Ξ)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {transferToAccount 
                  ? `Card balance: ${selectedCard ? formatCurrency(selectedCard.balance, selectedCard.currency) : '0.00'}` 
                  : `Account balance: ${formatCurrency(balances?.[form.getValues('currency')] || 0, form.getValues('currency'))}`
                }
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
                    {form.getValues('currency') === 'USD' ? '$' : 
                     form.getValues('currency') === 'EUR' ? '€' : 
                     form.getValues('currency') === 'BTC' ? '₿' : 'Ξ'}
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
            transferToAccount ? "Transfer to Account" : "Add Funds to Card"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default FundCardForm;
