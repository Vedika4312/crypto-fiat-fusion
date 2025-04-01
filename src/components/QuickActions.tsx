
import { ArrowDownToLine, ArrowUpToLine, RefreshCw, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button asChild className="justify-start">
          <Link to="/send">
            <ArrowUpToLine className="mr-2 h-4 w-4" />
            Send Money
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="justify-start">
          <Link to="/receive">
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Receive Money
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="justify-start">
          <Link to="/convert">
            <RefreshCw className="mr-2 h-4 w-4" />
            Convert Currency
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link to="/virtual-card">
            <CreditCard className="mr-2 h-4 w-4" />
            Virtual Cards
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
