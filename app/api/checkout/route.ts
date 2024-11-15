import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Cart } from '@/lib/models/cart.model';
import { Payment } from '@/lib/models/payment.model';
import { createBkashPayment } from '@/lib/bkash';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: session.user.id }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Create bKash payment
    const bkashPayment = await createBkashPayment(cart.total, session.user.id);

    // Create payment record
    const payment = new Payment({
      amount: cart.total,
      currency: 'BDT',
      provider: 'bkash',
      paymentId: bkashPayment.paymentID,
      status: 'pending',
      metadata: {
        cartData: cart.toJSON(), // Store cart data for order creation after payment
        userId: session.user.id,
      },
    });

    await payment.save();

    return Response.json({
      paymentId: payment._id,
      bkashURL: bkashPayment.bkashURL,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process checkout',
      },
      { status: 500 }
    );
  }
}
