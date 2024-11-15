import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

interface CartSummaryProps {
  cart: any;
}

export function CartSummary({ cart }: CartSummaryProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process checkout');
      }

      const { paymentId, bkashURL } = await response.json();
      
      // Redirect to payment status page first
      router.push(`/checkout/${paymentId}/status`);
      
      // Then redirect to bKash payment page
      if (bkashURL) {
        window.location.href = bkashURL;
      } else {
        throw new Error('Invalid payment URL');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process checkout',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(cart.total, 'USD')}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Processing Fee</span>
          <span>{formatCurrency(0, 'USD')}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatCurrency(cart.total, 'USD')}</span>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay with bKash
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Secure payment powered by bKash
        </p>
      </div>
    </Card>
  );
}