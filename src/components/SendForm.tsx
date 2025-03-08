
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Send } from 'lucide-react';
import { sendPayment } from '@/services/transactionService';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatCurrency';

const sendSchema = z.object({
  recipient: z.string().min(1, { message: 'Recipient ID is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be greater than 0' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  description: z.string().optional(),
});

const FIAT_CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' }
];

const CRYPTO_CURRENCIES = [
  { value: 'BTC', label: 'Bitcoin (BTC)', symbol: '₿' },
  { value: 'ETH', label: 'Ethereum (ETH)', symbol: 'Ξ' }
];

const SendForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const { user } = useAuth();
  const { balances, refetch } = useTransactions();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof sendSchema>>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      recipient: '',
      amount: undefined,
      currency: 'USD',
      description: '',
    },
  });

  // Get currency symbol for input prefix
  const getCurrencySymbol = (currency: string) => {
    const fiatCurrency = FIAT_CURRENCIES.find(c => c.value === currency);
    if (fiatCurrency) return fiatCurrency.symbol;
    
    const cryptoCurrency = CRYPTO_CURRENCIES.find(c => c.value === currency);
    if (cryptoCurrency) return cryptoCurrency.symbol;
    
    return '$'; // Default
  };

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    form.setValue('currency', value);
  };

  const onSubmit = async (values: z.infer<typeof sendSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Make sure user is authenticated
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to send payments",
          variant: "destructive",
        });
        return;
      }
      
      // Check if recipient is the same as sender
      if (values.recipient === user.id) {
        toast({
          title: "Invalid Recipient",
          description: "You cannot send payments to yourself",
          variant: "destructive",
        });
        return;
      }
      
      // Check if user has sufficient balance
      const currentBalance = balances?.[values.currency] || 0;
      if (currentBalance < values.amount) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${values.amount} ${values.currency} but only have ${currentBalance} ${values.currency}`,
          variant: "destructive",
        });
        return;
      }
      
      // Check if it's a crypto currency
      const isCrypto = ['BTC', 'ETH'].includes(values.currency);
      
      // Send the payment
      const { data, error } = await sendPayment({
        recipient_id: values.recipient,
        amount: values.amount,
        currency: values.currency,
        is_crypto: isCrypto,
        description: values.description || 'Payment',
      });
      
      if (error) {
        throw error;
      }
      
      // Success message and refresh balances
      toast({
        title: "Payment Successful!",
        description: `Sent ${values.amount} ${values.currency} to ${values.recipient}`,
        variant: "default",
      });
      
      // Refresh transactions and balances
      refetch();
      
      // Reset form
      form.reset({
        recipient: '',
        amount: undefined,
        currency: selectedCurrency,
        description: '',
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || 'Please try again later',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto mt-4 animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Send Payment</CardTitle>
        <CardDescription>Send money to other users with their ID or address</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fiat" className="mb-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="fiat">Fiat Currency</TabsTrigger>
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
          </TabsList>
          <TabsContent value="fiat" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter recipient's User ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select 
                          onValueChange={(value) => handleCurrencyChange(value)} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FIAT_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                              {getCurrencySymbol(selectedCurrency)}
                            </div>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01" 
                              className="pl-7" 
                              {...field} 
                              max={balances?.[selectedCurrency] || 0}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Available: {formatCurrency(balances?.[selectedCurrency] || 0, selectedCurrency)}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="What's this payment for?" {...field} />
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
                    <div className="flex items-center">
                      <Send className="mr-2 h-4 w-4" /> 
                      Send Payment
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="crypto" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient ID or Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter recipient's User ID or crypto address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select 
                          onValueChange={(value) => handleCurrencyChange(value)} 
                          defaultValue="BTC"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CRYPTO_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <Input 
                            type="number" 
                            placeholder="0.00000000" 
                            step="0.00000001" 
                            {...field} 
                            max={balances?.[selectedCurrency] || 0}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Available: {balances?.[selectedCurrency] || 0} {selectedCurrency}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="What's this payment for?" {...field} />
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
                    <div className="flex items-center">
                      <Send className="mr-2 h-4 w-4" /> 
                      Send {selectedCurrency}
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SendForm;
