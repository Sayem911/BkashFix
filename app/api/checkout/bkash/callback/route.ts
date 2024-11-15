import { NextRequest } from 'next/server';
import { Order } from '@/lib/models/order.model';
import { Payment } from '@/lib/models/payment.model';
import { Cart } from '@/lib/models/cart.model';
import { executeBkashPayment } from '@/lib/bkash';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status');

    if (!paymentID || !status) {
      return Response.redirect(new URL('/orders/error', req.url));
    }

    // Find payment record
    const payment = await Payment.findOne({ paymentId: paymentID });
    if (!payment) {
      console.error('Payment not found:', paymentID);
      return Response.redirect(new URL('/orders/error', req.url));
    }

    // Check if payment is already processed
    if (payment.status === 'completed') {
      return Response.redirect(new URL(`/orders/${payment.orderId}/success`, req.url));
    }

    if (status === 'success') {
      try {
        // Execute payment
        const paymentResult = await executeBkashPayment(paymentID);
        
        if (paymentResult.statusCode === '0000' && 
            paymentResult.transactionStatus === 'Completed') {
          // Start transaction
          const dbSession = await Order.startSession();
          dbSession.startTransaction();

          try {
            // Create order from stored cart data
            const cartData = payment.metadata.cartData;
            const orderNumber = await generateOrderNumber();

            const order = new Order({
              orderNumber,
              customer: payment.metadata.userId,
              items: cartData.items.map((item: any) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price,
                subProductName: item.subProductName,
                metadata: item.metadata
              })),
              total: cartData.total,
              status: 'processing',
              paymentStatus: 'paid',
              payment: {
                provider: 'bkash',
                transactionId: paymentResult.trxID,
                amount: payment.amount,
                currency: payment.currency,
                paymentId: paymentID
              }
            });

            await order.save({ session: dbSession });

            // Update payment status
            payment.status = 'completed';
            payment.transactionId = paymentResult.trxID;
            payment.orderId = order._id;
            await payment.save({ session: dbSession });

            // Clear user's cart
            await Cart.findOneAndDelete(
              { user: payment.metadata.userId },
              { session: dbSession }
            );

            await dbSession.commitTransaction();
            return Response.redirect(new URL(`/orders/${order._id}/success`, req.url));
          } catch (error) {
            await dbSession.abortTransaction();
            throw error;
          } finally {
            dbSession.endSession();
          }
        }
      } catch (error) {
        console.error('Payment execution error:', error);
        // Update payment status to failed if execution fails
        payment.status = 'failed';
        payment.metadata = {
          ...payment.metadata,
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : 'Payment execution failed'
        };
        await payment.save();
      }
    }

    if (status === 'cancel' || status === 'failure') {
      // Update payment status
      payment.status = 'failed';
      payment.metadata = {
        ...payment.metadata,
        cancelledAt: new Date(),
        cancelReason: status === 'cancel' ? 'User cancelled the transaction' : 'Payment failed'
      };
      await payment.save();

      // Redirect based on status
      const redirectPath = status === 'cancel' ? 'cancelled' : 'failed';
      return Response.redirect(new URL(`/orders/${payment._id}/${redirectPath}`, req.url));
    }

    // Default error redirect
    return Response.redirect(new URL('/orders/error', req.url));
  } catch (error) {
    console.error('bKash callback error:', error);
    return Response.redirect(new URL('/orders/error', req.url));
  }
}

async function generateOrderNumber() {
  const count = await Order.countDocuments();
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const sequence = (count + 1).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${sequence}`;
}