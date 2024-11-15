'use client';

import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockTransactions = [
  {
    id: 1,
    type: 'credit',
    amount: 100,
    description: 'Wallet Top Up',
    date: '2024-02-10T10:00:00Z',
    status: 'completed',
  },
  {
    id: 2,
    type: 'debit',
    amount: 49.99,
    description: 'PUBG UC Purchase',
    date: '2024-02-09T15:30:00Z',
    status: 'completed',
  },
];

export function WalletOverview() {
  const [balance] = useState(523.45);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTopUp = async () => {
    // Implement top-up logic
    setIsDialogOpen(false);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>
          Manage your wallet balance and view transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Card */}
        <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-purple-500">Current Balance</p>
              <h2 className="text-3xl font-bold mt-2">
                {formatCurrency(balance, 'USD')}
              </h2>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Top Up
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-purple-900/20">
                <DialogHeader>
                  <DialogTitle>Top Up Wallet</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to add to your wallet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <Button onClick={handleTopUp} className="w-full bg-purple-600 hover:bg-purple-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
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
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount, 'USD')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </>
  );
}