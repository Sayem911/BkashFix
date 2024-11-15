import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function WalletTopUpError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Top Up Failed</h1>
        <p className="text-muted-foreground mb-6">
          We encountered an error processing your wallet top-up. Please try again or contact support if the problem persists.
        </p>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/reseller">Return to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/support">Contact Support</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}