import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import dbConnect from '@/lib/db/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const order = await Order.findOne({
      _id: params.id,
      customer: session.user.id
    }).populate('items.product', 'title imageUrl');

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return Response.json(order);
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    return Response.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}