'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Plus, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Transaction {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export function WalletCard() {
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/reseller/wallet');
      if (!response.ok) throw new Error('Failed to fetch wallet data');
      const data = await response.json();
      setWalletData(data);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setTopupLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reseller/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process top-up');
      }

      const { bkashURL } = await response.json();
      
      // Redirect to bKash payment page
      window.location.href = bkashURL;
    } catch (error) {
      console.error('Top-up error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process top-up');
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!walletData) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Wallet Balance</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Top Up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Top Up Wallet</DialogTitle>
              <DialogDescription>
                Enter the amount you want to add to your wallet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Enter amount in BDT"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleTopUp} 
                className="w-full"
                disabled={topupLoading}
              >
                {topupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay with bKash
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Wallet className="h-8 w-8 text-primary" />
          <div>
            <div className="text-3xl font-bold">
              {formatCurrency(walletData.balance, 'BDT')}
            </div>
            <p className="text-sm text-muted-foreground">
              Available for purchases
            </p>
          </div>
        </div>

        {walletData.transactions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Recent Transactions</h3>
            <div className="space-y-3">
              {walletData.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${
                        transaction.type === 'credit'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <p className="font-medium">{transaction.description}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={
                    transaction.type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }>
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount, 'BDT')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}