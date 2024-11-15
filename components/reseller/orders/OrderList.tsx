'use client';

import { useState, useEffect } from 'react';
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
import { ProcessOrderDialog } from './ProcessOrderDialog';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      title: string;
      imageUrl: string;
    };
    quantity: number;
    price: number;
    subProductName: string;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchWalletBalance();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/reseller/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/reseller/wallet');
      if (!response.ok) throw new Error('Failed to fetch wallet balance');
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-500">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
        <p className="text-muted-foreground">
          You don't have any orders to process yet.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order._id}>
            <TableCell className="font-medium">
              {order.orderNumber}
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="text-sm">
                    {item.quantity}x {item.product.title} ({item.subProductName})
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>{formatCurrency(order.total, 'USD')}</TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell>
              {new Date(order.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {order.status === 'pending' && (
                <ProcessOrderDialog
                  order={order}
                  walletBalance={walletBalance}
                  onSuccess={() => {
                    fetchOrders();
                    fetchWalletBalance();
                  }}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}