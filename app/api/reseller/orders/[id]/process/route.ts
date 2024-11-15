import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get order and reseller
      const [order, reseller] = await Promise.all([
        Order.findById(params.id).session(session),
        User.findById(session.user.id).session(session)
      ]);

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.reseller.toString() !== session.user.id) {
        throw new Error('Not authorized to process this order');
      }

      if (order.status !== 'pending') {
        throw new Error('Order cannot be processed');
      }

      // Check wallet balance
      if (reseller.wallet.balance < order.cost) {
        throw new Error('Insufficient wallet balance');
      }

      // Update wallet balance
      await User.findByIdAndUpdate(
        session.user.id,
        {
          $inc: { 'wallet.balance': -order.cost },
          $push: {
            'wallet.transactions': {
              type: 'debit',
              amount: order.cost,
              description: `Order #${order._id}`,
              status: 'completed'
            }
          }
        },
        { session }
      );

      // Update order status
      order.status = 'processing';
      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return Response.json(order);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Failed to process order:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process order' },
      { status: 500 }
    );
  }
}