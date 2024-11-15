'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const recentOrders = [
  {
    id: '1',
    product: 'Mobile Legends Diamonds',
    customer: 'John Doe',
    status: 'completed',
    amount: '$99.00',
  },
  {
    id: '2',
    product: 'PUBG UC',
    customer: 'Jane Smith',
    status: 'processing',
    amount: '$45.00',
  },
  {
    id: '3',
    product: 'Free Fire Diamonds',
    customer: 'Bob Johnson',
    status: 'pending',
    amount: '$25.00',
  },
  {
    id: '4',
    product: 'Steam Wallet Code',
    customer: 'Alice Brown',
    status: 'completed',
    amount: '$50.00',
  },
  {
    id: '5',
    product: 'Valorant Points',
    customer: 'Charlie Wilson',
    status: 'completed',
    amount: '$35.00',
  },
];

export function RecentOrders() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.product}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.status}
              </div>
            </TableCell>
            <TableCell className="text-right">{order.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}