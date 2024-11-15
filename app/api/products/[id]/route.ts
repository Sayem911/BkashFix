import { NextRequest } from 'next/server';
import { Product } from '@/lib/models/product.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    return Response.json(product);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.description || !data.imageUrl || !data.subProducts?.length) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        title: data.title,
        description: data.description,
        guide: data.guide || '',
        guideEnabled: Boolean(data.guideEnabled),
        imageUrl: data.imageUrl,
        region: data.region,
        instantDelivery: Boolean(data.instantDelivery),
        importantNote: data.importantNote || '',
        customFields: data.customFields || [],
        subProducts: data.subProducts.map((sp: any) => ({
          ...sp,
          inStock: Boolean(sp.inStock)
        })),
        isIDBased: Boolean(data.isIDBased),
        idFields: data.idFields || [],
        category: data.category,
        popularity: data.popularity,
        countryCode: data.countryCode,
        displayOrder: Number(data.displayOrder) || 0
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    return Response.json(
      { error: 'Failed to update product' },
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
    if (session?.user?.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const product = await Product.findByIdAndDelete(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return Response.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}