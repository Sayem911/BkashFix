import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function WalletTopUpSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Top Up Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your wallet has been topped up successfully. The balance will be updated shortly.
        </p>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/reseller">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/reseller/orders">View Orders</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}