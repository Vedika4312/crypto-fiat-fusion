
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const convertSchema = z.object({
  fromAmount: z.coerce.number().positive({ message: 'Amount must be greater than 0' }),
  fromCurrency: z.string().min(1, { message: 'Source currency is required' }),
  toCurrency: z.string().min(1, { message: 'Target currency is required' }),
});

// Mock exchange rates
const exchangeRates = {
  USD: {
    BTC: 0.000016,
    ETH: 0.00023,
    EUR: 0.85,
  },
  EUR: {
    USD: 1.18,
    BTC: 0.000019,
    ETH: 0.00027,
  },
  BTC: {
    USD: 62500,
    EUR: 53125,
    ETH: 14.3,
  },
  ETH: {
    USD: 4375,
    EUR: 3718.75,
    BTC: 0.07,
  },
};

const CurrencyConverter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  
  const form = useForm<z.infer<typeof convertSchema>>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      fromAmount: undefined,
      fromCurrency: 'USD',
      toCurrency: 'BTC',
    },
  });

  const watchFromCurrency = form.watch('fromCurrency');
  const watchToCurrency = form.watch('toCurrency');

  // Prevent selecting the same currency
  const handleCurrencyChange = (field: any, value: string) => {
    if (field.name === 'fromCurrency' && value === watchToCurrency) {
      form.setValue('toCurrency', watchFromCurrency);
    } else if (field.name === 'toCurrency' && value === watchFromCurrency) {
      form.setValue('fromCurrency', watchToCurrency);
    }
    field.onChange(value);
  };

  const swapCurrencies = () => {
    const fromCurrency = form.getValues('fromCurrency');
    const toCurrency = form.getValues('toCurrency');
    const fromAmount = form.getValues('fromAmount');
    
    form.setValue('fromCurrency', toCurrency);
    form.setValue('toCurrency', fromCurrency);
    
    // If we have a converted amount, swap the direction
    if (convertedAmount !== null && fromAmount) {
      form.setValue('fromAmount', convertedAmount);
      calculate(convertedAmount, toCurrency, fromCurrency);
    }
  };

  const calculate = (amount: number, from: string, to: string) => {
    // @ts-ignore
    const rate = exchangeRates[from][to];
    return amount * rate;
  };

  const onSubmit = async (values: z.infer<typeof convertSchema>) => {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = calculate(
        values.fromAmount,
        values.fromCurrency,
        values.toCurrency
      );
      
      setConvertedAmount(result);
      
      toast.success('Conversion calculated', {
        description: `${values.fromAmount} ${values.fromCurrency} = ${result.toFixed(8)} ${values.toCurrency}`,
      });
    } catch (error) {
      toast.error('Failed to calculate conversion', {
        description: 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto mt-4 animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Currency Converter</CardTitle>
        <CardDescription>Convert between fiat and cryptocurrencies</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="fromAmount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="any" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fromCurrency"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormLabel>From</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => handleCurrencyChange(field, value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-center my-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-full h-10 w-10 p-0 flex items-center justify-center border-dashed"
                  onClick={swapCurrencies}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex space-x-4">
                <FormItem className="flex-1">
                  <FormLabel>Converted Amount</FormLabel>
                  <Input 
                    readOnly 
                    value={convertedAmount !== null ? convertedAmount.toFixed(8) : ''} 
                    placeholder="0.00"
                    className="bg-muted/40"
                  />
                </FormItem>
                
                <FormField
                  control={form.control}
                  name="toCurrency"
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormLabel>To</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => handleCurrencyChange(field, value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Converting...
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  Convert
                </div>
              )}
            </Button>
          </form>
        </Form>
        
        {/* Exchange rate info */}
        {watchFromCurrency && watchToCurrency && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Exchange rate:</p>
            <p className="font-medium">
              1 {watchFromCurrency} = {
                // @ts-ignore
                exchangeRates[watchFromCurrency][watchToCurrency].toFixed(
                  watchToCurrency === 'BTC' || watchToCurrency === 'ETH' ? 8 : 2
                )
              } {watchToCurrency}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
