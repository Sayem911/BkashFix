import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Store } from '@/lib/models/store.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return Response.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Get store settings for markup validation
    const store = await Store.findOne({ reseller: session.user.id });
    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const { minimumMarkup, maximumMarkup } = store.settings;

    // Validate all markups
    for (const product of products) {
      const markup = product.markup;
      if (markup < minimumMarkup || markup > maximumMarkup) {
        return Response.json({
          error: `Markup for product ${product.productId} must be between ${minimumMarkup}% and ${maximumMarkup}%`
        }, { status: 400 });
      }
    }

    // Update store's product pricing
    const updates = products.reduce((acc: any, product: any) => {
      acc[`productPricing.${product.productId}`] = {
        markup: product.markup,
        updatedAt: new Date()
      };
      return acc;
    }, {});

    await Store.findOneAndUpdate(
      { reseller: session.user.id },
      { $set: updates }
    );

    return Response.json({
      success: true,
      message: 'Product pricing updated successfully'
    });
  } catch (error) {
    console.error('Failed to update product pricing:', error);
    return Response.json(
      { error: 'Failed to update product pricing' },
      { status: 500 }
    );
  }
}