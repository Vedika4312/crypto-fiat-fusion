
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

const DashboardSkeletonLoader = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Skeleton className="h-8 w-24" />
      </div>
      <p className="text-muted-foreground mb-8">Welcome back to your Fusion Pay account</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card Skeleton */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-medium">Your Balance</CardTitle>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        
        {/* Balance Table Skeleton */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Balance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        
        {/* Transaction History Skeleton */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardSkeletonLoader;
