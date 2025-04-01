
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import VirtualCardDisplay from '@/components/VirtualCardDisplay';
import FundCardForm from '@/components/FundCardForm';
import CardTransferForm from '@/components/CardTransferForm';
import { Button } from '@/components/ui/button';
import { useVirtualCards } from '@/hooks/useVirtualCards';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRightLeft, Wallet, CreditCard, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CreateCardForm from '@/components/CreateCardForm';

const VirtualCard = () => {
  const { user } = useAuth();
  const { cards, loading, refetch } = useVirtualCards();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  
  useEffect(() => {
    if (cards.length > 0 && !activeCardId) {
      setActiveCardId(cards[0].id);
    }
  }, [cards, activeCardId]);

  // Get the active card details
  const activeCard = cards.find(card => card.id === activeCardId) || null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16 animate-fade-in">
          <div className="container app-container">
            <h1 className="text-3xl font-bold mb-2">Virtual Cards</h1>
            <p className="text-muted-foreground mb-8">Loading your virtual cards...</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[240px] w-full lg:col-span-2" />
              <Skeleton className="h-[240px] w-full" />
              <Skeleton className="h-[300px] w-full lg:col-span-3" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 animate-fade-in">
        <div className="container app-container">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Virtual Cards</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Create New Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Virtual Card</DialogTitle>
                  <DialogDescription>
                    Create a new virtual card to manage your funds separately.
                  </DialogDescription>
                </DialogHeader>
                <CreateCardForm onSuccess={() => {
                  refetch();
                }} />
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-muted-foreground mb-8">Manage your virtual payment cards</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Virtual Card Display */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Virtual Card</CardTitle>
                <CardDescription>
                  {cards.length === 0 
                    ? "Create your first virtual card to get started" 
                    : "Select and manage your virtual cards"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Virtual Cards</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any virtual cards yet.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Virtual Card</DialogTitle>
                          <DialogDescription>
                            Create a new virtual card to manage your funds separately.
                          </DialogDescription>
                        </DialogHeader>
                        <CreateCardForm onSuccess={() => {
                          refetch();
                        }} />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {cards.map(card => (
                        <Button
                          key={card.id}
                          variant={card.id === activeCardId ? "default" : "outline"}
                          className="whitespace-nowrap"
                          onClick={() => setActiveCardId(card.id)}
                        >
                          {card.name}
                        </Button>
                      ))}
                    </div>
                    
                    {activeCard && (
                      <VirtualCardDisplay card={activeCard} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Card Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Card Actions</CardTitle>
                <CardDescription>Manage your card balance</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button 
                  disabled={cards.length === 0} 
                  className="justify-start"
                  variant={cards.length === 0 ? "secondary" : "default"}
                  asChild
                >
                  <DialogTrigger>
                    <Wallet className="mr-2 h-4 w-4" />
                    Add Funds to Card
                  </DialogTrigger>
                </Button>
                
                <Button 
                  disabled={cards.length === 0} 
                  className="justify-start" 
                  variant="outline"
                  asChild
                >
                  <DialogTrigger>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Transfer to Account
                  </DialogTrigger>
                </Button>
                
                <Button 
                  disabled={cards.length === 0} 
                  className="justify-start" 
                  variant="outline"
                  asChild
                >
                  <DialogTrigger>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Send to Another Card
                  </DialogTrigger>
                </Button>
              </CardContent>
            </Card>
            
            {/* Fund Card Dialog */}
            <Dialog>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to Card</DialogTitle>
                  <DialogDescription>
                    Transfer money from your account balance to your virtual card
                  </DialogDescription>
                </DialogHeader>
                <FundCardForm 
                  cardId={activeCardId || ""} 
                  onSuccess={() => refetch()} 
                />
              </DialogContent>
            </Dialog>

            {/* Card to Account Dialog */}
            <Dialog>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer to Account</DialogTitle>
                  <DialogDescription>
                    Move funds from your virtual card back to your main account
                  </DialogDescription>
                </DialogHeader>
                <FundCardForm 
                  cardId={activeCardId || ""} 
                  onSuccess={() => refetch()} 
                  transferToAccount={true}
                />
              </DialogContent>
            </Dialog>

            {/* Card to Card Dialog */}
            <Dialog>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send to Another Card</DialogTitle>
                  <DialogDescription>
                    Transfer funds to another user's virtual card
                  </DialogDescription>
                </DialogHeader>
                <CardTransferForm 
                  cardId={activeCardId || ""} 
                  onSuccess={() => refetch()} 
                />
              </DialogContent>
            </Dialog>
            
            {/* Card Activity */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Card Activity</CardTitle>
                <CardDescription>Recent card transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {cards.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Create a virtual card to see your transaction history</p>
                  </div>
                ) : activeCard ? (
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Transactions</TabsTrigger>
                      <TabsTrigger value="incoming">Incoming</TabsTrigger>
                      <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      {activeCard.transactions && activeCard.transactions.length > 0 ? (
                        <div className="space-y-2">
                          {activeCard.transactions.map(transaction => (
                            <div key={transaction.id} className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(transaction.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className={`font-medium ${transaction.type === 'receive' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'receive' ? '+' : '-'}
                                {transaction.amount} {transaction.currency}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <p className="text-muted-foreground">No transactions yet</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="incoming">
                      {activeCard.transactions && 
                       activeCard.transactions.filter(t => t.type === 'receive').length > 0 ? (
                        <div className="space-y-2">
                          {activeCard.transactions
                            .filter(t => t.type === 'receive')
                            .map(transaction => (
                              <div key={transaction.id} className="flex justify-between items-center p-3 border rounded">
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(transaction.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <div className="font-medium text-green-600">
                                  +{transaction.amount} {transaction.currency}
                                </div>
                              </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <p className="text-muted-foreground">No incoming transactions yet</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="outgoing">
                      {activeCard.transactions && 
                       activeCard.transactions.filter(t => t.type === 'send').length > 0 ? (
                        <div className="space-y-2">
                          {activeCard.transactions
                            .filter(t => t.type === 'send')
                            .map(transaction => (
                              <div key={transaction.id} className="flex justify-between items-center p-3 border rounded">
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(transaction.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <div className="font-medium text-red-600">
                                  -{transaction.amount} {transaction.currency}
                                </div>
                              </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <p className="text-muted-foreground">No outgoing transactions yet</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">Select a card to view transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VirtualCard;
