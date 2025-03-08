
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

const sendSchema = z.object({
  recipient: z.string().min(1, { message: 'Recipient ID is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be greater than 0' }),
  description: z.string().optional(),
});

const SendForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { balances, refetch } = useTransactions();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof sendSchema>>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      recipient: '',
      amount: undefined,
      description: '',
    },
  });

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
      const currentBalance = balances?.USD || 0;
      if (currentBalance < values.amount) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${values.amount} USD but only have ${currentBalance} USD`,
          variant: "destructive",
        });
        return;
      }
      
      // Send the payment
      const { data, error } = await sendPayment({
        recipient_id: values.recipient,
        amount: values.amount,
        currency: 'USD',
        is_crypto: false,
        description: values.description || 'Payment',
      });
      
      if (error) {
        throw error;
      }
      
      // Success message and refresh balances
      toast({
        title: "Payment Successful!",
        description: `Sent ${values.amount} USD to ${values.recipient}`,
        variant: "default",
      });
      
      // Refresh transactions and balances
      refetch();
      
      // Reset form
      form.reset();
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
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
                            $
                          </div>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01" 
                            className="pl-7" 
                            {...field} 
                            max={balances?.USD || 0}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Available balance: ${balances?.USD || 0}
                      </p>
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
            <div className="space-y-6">
              <div className="rounded-lg border p-4 text-center text-muted-foreground">
                <p>Cryptocurrency sending functionality coming soon!</p>
              </div>
              
              <Button variant="outline" className="w-full" disabled>
                <div className="flex items-center">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Preview Crypto Sending
                </div>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SendForm;
