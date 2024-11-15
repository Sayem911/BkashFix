import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ban } from 'lucide-react';
import Link from 'next/link';

export default function WalletTopUpCancelled() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-yellow-500/10">
            <Ban className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Top Up Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          You cancelled the top-up process. No charges have been made to your account.
        </p>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/reseller">Return to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/reseller/wallet">Try Again</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}