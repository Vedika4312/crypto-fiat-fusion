
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';
import { adminAddFunds } from '@/services/transactionService';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuth = async (action: 'signin' | 'signup') => {
    if (action === 'signin' && (!email || !password)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (action === 'signup' && (!email || !password || !username)) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all fields including username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = action === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password, username);
      
      if (error) {
        console.error("Auth error:", error);
        // Toast notification is handled in AuthContext
      } else if (action === 'signup') {
        // Create initial balances for new users
        if (user) {
          try {
            // Add initial amounts of each currency for new users
            await Promise.all([
              adminAddFunds(user.id, 100, 'USD', false, 'Initial deposit'),
              adminAddFunds(user.id, 100, 'EUR', false, 'Initial deposit'),
              adminAddFunds(user.id, 0.005, 'BTC', true, 'Initial deposit'),
              adminAddFunds(user.id, 0.05, 'ETH', true, 'Initial deposit')
            ]);
          } catch (fundError) {
            console.error("Failed to add initial funds:", fundError);
          }
        }
      }
    } catch (error) {
      console.error("Unexpected auth error:", error);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="font-semibold text-2xl tracking-tight">Fusion Pay</span>
          </div>
        </div>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('signin')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Sign up for a Fusion Pay account to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('signup')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
