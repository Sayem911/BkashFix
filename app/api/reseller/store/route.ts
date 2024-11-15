import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Store } from '@/lib/models/store.model';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const store = await Store.findOne({ reseller: session.user.id });
    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return Response.json(store);
  } catch (error) {
    console.error('Failed to fetch store:', error);
    return Response.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const store = await Store.findOne({ reseller: session.user.id });

    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (data.name) store.name = data.name;
    if (data.description) store.description = data.description;
    if (data.logo) store.logo = data.logo;
    if (data.theme) store.theme = { ...store.theme, ...data.theme };
    if (data.settings) store.settings = { ...store.settings, ...data.settings };

    await store.save();

    return Response.json(store);
  } catch (error) {
    console.error('Failed to update store:', error);
    return Response.json(
      { error: 'Failed to update store' },
      { status: 500 }
    );
  }
}