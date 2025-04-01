
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatCurrency';
import { VirtualCard } from '@/hooks/useVirtualCards';
import { CreditCard } from 'lucide-react';

interface VirtualCardDisplayProps {
  card: VirtualCard;
}

const VirtualCardDisplay = ({ card }: VirtualCardDisplayProps) => {
  // Format the card number for display (show last 4 digits only)
  const formattedCardNumber = `•••• •••• •••• ${card.card_number.slice(-4)}`;
  
  // Format expiry date
  const expiryDate = new Date(card.expiry_date);
  const formattedExpiry = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`;
  
  return (
    <div className="flex flex-col space-y-4">
      <Card className={`relative overflow-hidden h-48 w-full max-w-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg rounded-xl`}>
        <CardContent className="p-6 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{card.name}</h3>
              <p className="text-xs opacity-80">Virtual Card</p>
            </div>
            <CreditCard className="h-8 w-8 opacity-80" />
          </div>
          
          <div className="text-xl font-mono tracking-wider py-4">
            {formattedCardNumber}
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-80">Balance</p>
              <p className="font-bold">{formatCurrency(card.balance, card.currency)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Expires</p>
              <p className="font-medium">{formattedExpiry}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Card Number</p>
          <p className="font-mono">{formattedCardNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground">CVV</p>
          <p className="font-mono">•••</p>
        </div>
        <div>
          <p className="text-muted-foreground">Expiry Date</p>
          <p>{formattedExpiry}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${card.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{card.active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCardDisplay;
