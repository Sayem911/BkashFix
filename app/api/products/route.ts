import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Product } from '@/lib/models/product.model';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const popularity = searchParams.getAll('popularity');
    const instantDelivery = searchParams.get('instantDelivery');

    let query: any = {};

    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }

    if (popularity.length > 0) {
      query.popularity = { $in: popularity };
    }

    if (instantDelivery === 'true') {
      query.instantDelivery = true;
    }

    const products = await Product.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(50);

    return Response.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return Response.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
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

    // Create product
    const product = await Product.create({
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
    });

    return Response.json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    return Response.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}