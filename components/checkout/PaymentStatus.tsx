'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Ban } from 'lucide-react';

interface PaymentStatusProps {
  paymentId: string;
}

export function PaymentStatus({ paymentId }: PaymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | 'cancelled'>('pending');
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });

        if (!response.ok) throw new Error('Failed to verify payment');

        const data = await response.json();

        if (data.redirectUrl) {
          router.push(data.redirectUrl);
          return;
        }

        if (data.status !== 'pending') {
          setStatus(data.status);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 3 seconds
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [paymentId, router]);

  return (
    <Card className="p-6 text-center">
      {status === 'pending' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
          <p className="text-muted-foreground">
            Please complete your payment in the bKash window...
          </p>
        </>
      )}

      {status === 'completed' && (
        <>
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-4">
            Your order has been placed successfully.
          </p>
        </>
      )}

      {status === 'failed' && (
        <>
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't process your payment. Please try again.
          </p>
          <Button variant="destructive" onClick={() => router.push('/cart')}>
            Return to Cart
          </Button>
        </>
      )}

      {status === 'cancelled' && (
        <>
          <Ban className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Cancelled</h2>
          <p className="text-muted-foreground mb-4">
            You cancelled the payment process. No charges have been made.
          </p>
          <Button variant="outline" onClick={() => router.push('/cart')}>
            Return to Cart
          </Button>
        </>
      )}
    </Card>
  );
}