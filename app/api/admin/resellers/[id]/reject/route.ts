import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const reseller = await User.findById(params.id);
    if (!reseller) {
      return Response.json(
        { error: 'Reseller not found' },
        { status: 404 }
      );
    }

    if (reseller.role !== 'reseller') {
      return Response.json(
        { error: 'User is not a reseller' },
        { status: 400 }
      );
    }

    reseller.status = 'suspended';
    await reseller.save();

    return Response.json({
      message: 'Reseller application rejected',
      reseller: {
        id: reseller._id,
        name: reseller.name,
        email: reseller.email,
        status: reseller.status
      }
    });
  } catch (error) {
    console.error('Failed to reject reseller:', error);
    return Response.json(
      { error: 'Failed to reject reseller' },
      { status: 500 }
    );
  }
}