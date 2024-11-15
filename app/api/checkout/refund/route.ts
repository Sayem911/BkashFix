import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { Payment } from '@/lib/models/payment.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, reason } = await req.json();

    // Get order and payment
    const [order, payment] = await Promise.all([
      Order.findById(orderId),
      Payment.findOne({ orderId })
    ]);

    if (!order || !payment) {
      return Response.json(
        { error: 'Order or payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'completed') {
      return Response.json(
        { error: 'Payment cannot be refunded' },
        { status: 400 }
      );
    }

    // Start transaction
    const session = await Order.startSession();
    session.startTransaction();

    try {
      // Update payment status
      payment.status = 'refunded';
      payment.metadata = {
        ...payment.metadata,
        refundReason: reason,
        refundedAt: new Date(),
        refundedBy: session.user.id
      };
      await payment.save({ session });

      // Update order status
      order.status = 'refunded';
      order.paymentStatus = 'refunded';
      await order.save({ session });

      await session.commitTransaction();

      return Response.json({
        success: true,
        message: 'Refund processed successfully'
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Refund error:', error);
    return Response.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}