import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Cart } from '@/lib/models/cart.model';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let cart = await Cart.findOne({ user: session.user.id })
      .populate('items.product');

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: [],
        total: 0
      });
    }

    return Response.json(cart);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return Response.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}