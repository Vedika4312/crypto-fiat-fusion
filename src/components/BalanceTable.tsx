
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatCrypto } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface BalanceTableProps {
  balances: Record<string, number>;
  isLoading?: boolean;
  className?: string;
}

const BalanceTable = ({ balances, isLoading = false, className }: BalanceTableProps) => {
  // Define supported currencies - this ensures we display all currencies even if balance is 0
  const supportedFiat = ["USD", "EUR"];
  const supportedCrypto = ["BTC", "ETH"];

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <CardTitle className="text-xl font-medium">Balance Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-medium">Balance Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Currency</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Fiat currencies */}
            {supportedFiat.map((currency) => (
              <TableRow key={currency}>
                <TableCell className="font-medium">{currency}</TableCell>
                <TableCell>Fiat</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(balances[currency] || 0, currency)}
                </TableCell>
              </TableRow>
            ))}
            
            {/* Cryptocurrencies */}
            {supportedCrypto.map((currency) => (
              <TableRow key={currency}>
                <TableCell className="font-medium">{currency}</TableCell>
                <TableCell>Crypto</TableCell>
                <TableCell className="text-right">
                  {formatCrypto(balances[currency] || 0, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BalanceTable;
