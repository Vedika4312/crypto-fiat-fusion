
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader = ({ onRefresh }: DashboardHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh} 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">Welcome back to your Fusion Pay account</p>
    </>
  );
};

export default DashboardHeader;
