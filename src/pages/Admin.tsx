
import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownToLine, ArrowUpCircle, ArrowUpToLine, RefreshCw, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { isAdmin, loading, users, addFunds, withdrawFunds, refetch } = useAdmin();
  const navigate = useNavigate();
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [description, setDescription] = useState<string>('');
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  
  // Redirect non-admin users
  if (!loading && !isAdmin) {
    navigate('/dashboard');
    return null;
  }
  
  const handleAddFunds = async () => {
    if (!selectedUser || !amount || !currency) return;
    
    setOperationLoading(true);
    await addFunds(selectedUser, Number(amount), currency, description);
    setOperationLoading(false);
    
    // Reset form
    setAmount('');
    setDescription('');
  };
  
  const handleWithdrawFunds = async () => {
    if (!selectedUser || !amount || !currency) return;
    
    setOperationLoading(true);
    await withdrawFunds(selectedUser, Number(amount), currency, description);
    setOperationLoading(false);
    
    // Reset form
    setAmount('');
    setDescription('');
  };
  
  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || userId;
  };
  
  const getUserBalance = (userId: string, currency: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.balances) return 0;
    
    const balance = user.balances.find(b => b.currency === currency);
    return balance ? balance.balance : 0;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage user funds and accounts</p>
            </div>
            
            <Button onClick={refetch} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          
          {loading ? (
            <div className="grid gap-6">
              <Skeleton className="h-[300px] w-full rounded-lg" />
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Management */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>User Accounts</CardTitle>
                  <CardDescription>View and manage all user accounts in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="mb-6">
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>USD Balance</TableHead>
                        <TableHead>EUR Balance</TableHead>
                        <TableHead>BTC Balance</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell>{user.email || 'No email'}</TableCell>
                          <TableCell>${getUserBalance(user.id, 'USD')}</TableCell>
                          <TableCell>€{getUserBalance(user.id, 'EUR')}</TableCell>
                          <TableCell>{getUserBalance(user.id, 'BTC')} BTC</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No users found in the system
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Fund Management */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Fund Management</CardTitle>
                  <CardDescription>Add or withdraw funds from user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="add">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="add">Add Funds</TabsTrigger>
                      <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="add">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="user">Select User</Label>
                          <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger id="user">
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.email || user.id.substring(0, 8)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="BTC">BTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Input
                            id="description"
                            placeholder="Reason for adding funds"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={handleAddFunds} 
                          disabled={!selectedUser || !amount || operationLoading}
                          className="flex items-center gap-2"
                        >
                          {operationLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowDownToLine className="h-4 w-4" />
                          )}
                          Add Funds
                        </Button>
                      </div>
                      
                      {selectedUser && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm">
                            Adding <strong>{amount || '0'} {currency}</strong> to account of <strong>{getUserEmail(selectedUser)}</strong>
                          </p>
                          {selectedUser && currency && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Current balance: {getUserBalance(selectedUser, currency)} {currency}
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="withdraw">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-withdraw">Select User</Label>
                          <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger id="user-withdraw">
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.email || user.id.substring(0, 8)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="amount-withdraw">Amount</Label>
                          <Input
                            id="amount-withdraw"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="currency-withdraw">Currency</Label>
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency-withdraw">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="BTC">BTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description-withdraw">Description (Optional)</Label>
                          <Input
                            id="description-withdraw"
                            placeholder="Reason for withdrawal"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={handleWithdrawFunds} 
                          disabled={!selectedUser || !amount || operationLoading}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {operationLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowUpToLine className="h-4 w-4" />
                          )}
                          Withdraw Funds
                        </Button>
                      </div>
                      
                      {selectedUser && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm">
                            Withdrawing <strong>{amount || '0'} {currency}</strong> from account of <strong>{getUserEmail(selectedUser)}</strong>
                          </p>
                          {selectedUser && currency && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Current balance: {getUserBalance(selectedUser, currency)} {currency}
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
