import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Cart } from '@/lib/models/cart.model';
import { Product } from '@/lib/models/product.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, subProductName, quantity = 1, metadata = {} } = await req.json();

    // Validate product and get price
    const product = await Product.findById(productId);
    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const subProduct = product.subProducts.find(sp => sp.name === subProductName);
    if (!subProduct) {
      return Response.json(
        { error: 'Invalid product variant' },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items: [],
      });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.product.toString() === productId &&
        item.subProductName === subProductName
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        subProductName,
        quantity,
        price: subProduct.price,
        metadata
      });
    }

    await cart.save();
    await cart.populate('items.product');

    return Response.json(cart);
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    return Response.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}