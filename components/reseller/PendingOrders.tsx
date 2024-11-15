'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

const pendingOrders = [
  {
    id: '1',
    customer: 'John Doe',
    product: 'Mobile Legends Diamonds',
    quantity: 1000,
    price: 99.00,
    cost: 89.00,
    status: 'pending',
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    customer: 'Jane Smith',
    product: 'PUBG UC',
    quantity: 500,
    price: 49.99,
    cost: 45.00,
    status: 'pending',
    createdAt: '2024-03-20T09:30:00Z',
  },
  // Add more orders as needed
];

export function PendingOrders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleProcess = async (orderId: string) => {
    // Implement order processing logic here
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{formatCurrency(order.price, 'USD')}</TableCell>
              <TableCell>{formatCurrency(order.price - order.cost, 'USD')}</TableCell>
              <TableCell>
                <Badge variant="warning">{order.status}</Badge>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Process
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Process Order #{order.id}</DialogTitle>
                      <DialogDescription>
                        Review and process this order
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Cost</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(order.cost, 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Your Profit</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(order.price - order.cost, 'USD')}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleProcess(order.id)}
                        className="w-full"
                      >
                        Confirm & Process
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}