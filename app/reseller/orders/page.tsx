'use client';

import { Card } from '@/components/ui/card';
import { OrderList } from '@/components/reseller/orders/OrderList';

export default function ResellerOrders() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and process your customer orders
          </p>
        </div>
      </div>

      <Card>
        <OrderList />
      </Card>
    </div>
  );
}