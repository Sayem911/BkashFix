import { NextRequest } from 'next/server';
import { Order } from '@/lib/models/order.model';
import { Payment } from '@/lib/models/payment.model';
import dbConnect from '@/lib/db/mongodb';

// Verify bKash webhook signature
function verifyWebhookSignature(signature: string, payload: string): boolean {
  // Implement bKash webhook signature verification
  return true; // Placeholder
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Verify webhook signature
    const signature = req.headers.get('x-bkash-signature');
    if (!signature) {
      return Response.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const body = await req.text();
    if (!verifyWebhookSignature(signature, body)) {
      return Response.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Handle different webhook events
    switch (data.event) {
      case 'payment.success': {
        const payment = await Payment.findOne({ paymentId: data.paymentId });
        if (!payment) {
          return Response.json(
            { error: 'Payment not found' },
            { status: 404 }
          );
        }

        // Start transaction
        const session = await Order.startSession();
        session.startTransaction();

        try {
          // Update payment
          payment.status = 'completed';
          payment.transactionId = data.trxID;
          await payment.save({ session });

          // Update order
          const order = await Order.findById(payment.orderId);
          if (order) {
            order.status = 'processing';
            order.paymentStatus = 'paid';
            await order.save({ session });
          }

          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
        break;
      }

      case 'payment.failed': {
        const payment = await Payment.findOne({ paymentId: data.paymentId });
        if (payment) {
          payment.status = 'failed';
          await payment.save();

          const order = await Order.findById(payment.orderId);
          if (order) {
            order.status = 'failed';
            order.paymentStatus = 'failed';
            await order.save();
          }
        }
        break;
      }

      case 'payment.cancelled': {
        const payment = await Payment.findOne({ paymentId: data.paymentId });
        if (payment) {
          payment.status = 'failed';
          payment.metadata = {
            ...payment.metadata,
            cancelledAt: new Date(),
            cancelReason: 'User cancelled the transaction'
          };
          await payment.save();

          const order = await Order.findById(payment.orderId);
          if (order) {
            order.status = 'cancelled';
            order.paymentStatus = 'cancelled';
            await order.save();
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}