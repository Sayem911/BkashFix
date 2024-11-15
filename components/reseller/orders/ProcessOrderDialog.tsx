'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProcessOrderDialogProps {
  order: any;
  walletBalance: number;
  onSuccess: () => void;
}

export function ProcessOrderDialog({
  order,
  walletBalance,
  onSuccess
}: ProcessOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const totalCost = order.items.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity), 0
  );

  const handleProcess = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reseller/orders/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process order');
      }

      toast({
        title: 'Success',
        description: 'Order processed successfully',
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to process order:', error);
      setError(error instanceof Error ? error.message : 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };

  const insufficientBalance = walletBalance < totalCost;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Process Order</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Order #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            Review and process this order. This will deduct the cost from your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Order Cost</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalCost, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Wallet Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(walletBalance, 'USD')}
                </p>
              </div>
            </div>

            {insufficientBalance && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient wallet balance. Please top up your wallet.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="font-medium">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.subProductName} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity, 'USD')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price, 'USD')} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={loading || insufficientBalance}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Processing...' : 'Process Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}