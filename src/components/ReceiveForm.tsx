
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Download, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const ReceiveForm = () => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  
  const userId = user?.id || '';
  const shortenedId = userId.substring(0, 8);

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    toast.success('User ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="max-w-md w-full mx-auto mt-4 animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Receive Payment</CardTitle>
        <CardDescription>Share your ID or QR code to receive payments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="id" className="mb-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="id">User ID</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="id" className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label>Your User ID</Label>
              <div className="flex">
                <Input readOnly value={userId} className="rounded-r-none font-mono text-center text-sm sm:text-base overflow-hidden text-ellipsis" />
                <Button 
                  variant="secondary" 
                  type="button" 
                  className="rounded-l-none px-3" 
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Share this ID with others so they can send you payments
              </p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-medium mb-2">Instructions</h3>
              <ol className="list-decimal ml-5 space-y-2 text-sm text-muted-foreground">
                <li>Share your User ID with the sender</li>
                <li>The sender will enter your ID in the "Send" section</li>
                <li>Once the sender confirms the transaction, you'll receive the payment</li>
                <li>You'll be notified when the payment arrives in your account</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="qr" className="mt-6 flex flex-col items-center space-y-6">
            <div className="bg-white p-4 rounded-lg">
              <div className="w-48 h-48 bg-neutral-50 border flex items-center justify-center">
                <QrCode className="w-32 h-32 text-neutral-300" />
              </div>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button className="flex-1" variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </Button>
              <Button className="flex-1" variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Scan this QR code to easily share your payment details
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReceiveForm;
