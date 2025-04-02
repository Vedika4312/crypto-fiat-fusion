
import { Loader2 } from 'lucide-react';

const DashboardLoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
      <h2 className="text-xl font-medium text-muted-foreground mb-2">Loading your dashboard...</h2>
      <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
    </div>
  );
};

export default DashboardLoadingSpinner;
