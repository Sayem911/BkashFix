import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Cart } from '@/lib/models/cart.model';
import dbConnect from '@/lib/db/mongodb';

export async function PATCH(
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

    const { quantity } = await req.json();
    if (typeof quantity !== 'number' || quantity < 1) {
      return Response.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return Response.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === params.id
    );

    if (itemIndex === -1) {
      return Response.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return Response.json(cart);
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return Response.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return Response.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== params.id
    );
    await cart.save();

    return Response.json(cart);
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    return Response.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}