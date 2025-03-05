
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCrypto } from '@/utils/formatCurrency';

interface BalanceCardProps {
  className?: string;
}

const BalanceCard = ({ className }: BalanceCardProps) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Mock data
  const balances = {
    fiat: {
      usd: 2547.82,
      eur: 2184.35,
      change: 2.4,
    },
    crypto: {
      btc: 0.0352,
      eth: 1.28,
      change: -1.2,
    },
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };

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
                  {isBalanceHidden ? '••••••' : formatCurrency(balances.fiat.usd)}
                </div>
                <div className={cn(
                  "text-sm font-medium flex items-center",
                  balances.fiat.change >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {balances.fiat.change >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(balances.fiat.change)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">USD</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCurrency(balances.fiat.usd)}
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">EUR</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCurrency(balances.fiat.eur, 'EUR')}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total (BTC)</div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {isBalanceHidden ? '••••••' : formatCrypto(balances.crypto.btc)}
                </div>
                <div className={cn(
                  "text-sm font-medium flex items-center",
                  balances.crypto.change >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {balances.crypto.change >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(balances.crypto.change)}%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">BTC</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCrypto(balances.crypto.btc)}
                </div>
              </div>
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">ETH</div>
                <div className="text-lg font-medium">
                  {isBalanceHidden ? '••••••' : formatCrypto(balances.crypto.eth, 'ETH')}
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
