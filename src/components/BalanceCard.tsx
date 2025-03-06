
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCrypto } from '@/utils/formatCurrency';

interface BalanceCardProps {
  balances: Record<string, number>;
  isLoading?: boolean;
  className?: string;
}

const BalanceCard = ({ balances, isLoading = false, className }: BalanceCardProps) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

  // Extract balances for display
  const usdBalance = balances?.USD || 0;
  const eurBalance = balances?.EUR || 0;
  const btcBalance = balances?.BTC || 0;
  const ethBalance = balances?.ETH || 0;

  // Mock percentage change (you could calculate this from transaction history)
  const fiatChange = 2.4;
  const cryptoChange = -1.2;

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium">Your Balance</CardTitle>
            <div className="h-8 w-8"></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium">Your Balance</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleBalanceVisibility}
            className="h-8 w-8"
          >
            {isBalanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="fiat" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="fiat">Fiat</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fiat" className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Balance (USD)</div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {isBalanceHidden ? '••••••' : formatCurrency(usdBalance)}
                </div>
                <div className={cn(
                  "text-sm font-medium flex items-center",
                  fiatChange >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {fiatChange >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(fiatChange)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">USD</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCurrency(usdBalance)}
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">EUR</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCurrency(eurBalance, 'EUR')}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total (BTC)</div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {isBalanceHidden ? '••••••' : formatCrypto(btcBalance)}
                </div>
                <div className={cn(
                  "text-sm font-medium flex items-center",
                  cryptoChange >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {cryptoChange >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(cryptoChange)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">BTC</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCrypto(btcBalance)}
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">ETH</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCrypto(ethBalance, 'ETH')}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
