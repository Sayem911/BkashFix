'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface OrderDetailsProps {
  order: any;
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order._id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={order.customer.image} />
                  <AvatarFallback>
                    {order.customer.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{order.customer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.customer.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.product.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.subProductName}
                        </p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(item.price * item.quantity, 'USD')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(item.price, 'USD')} each
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between pt-4">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    {formatCurrency(order.total, 'USD')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <Badge
                    variant={
                      order.status === 'completed'
                        ? 'default'
                        : order.status === 'processing'
                        ? 'secondary'
                        : order.status === 'pending'
                        ? 'warning'
                        : 'destructive'
                    }
                    className="mt-1"
                  >
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge
                    variant={
                      order.paymentStatus === 'paid'
                        ? 'default'
                        : order.paymentStatus === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="mt-1"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                {order.payment?.transactionId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-medium">{order.payment.transactionId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}