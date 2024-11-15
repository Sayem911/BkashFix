import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import { Order } from '@/lib/models/order.model';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get reseller counts
    const [
      totalResellers,
      activeResellers,
      pendingApplications
    ] = await Promise.all([
      User.countDocuments({ role: 'reseller' }),
      User.countDocuments({ role: 'reseller', status: 'active' }),
      User.countDocuments({ role: 'reseller', status: 'pending' })
    ]);

    // Calculate total reseller revenue
    const resellerRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          reseller: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    const totalResellerRevenue = resellerRevenue[0]?.total || 0;

    return Response.json({
      totalResellers,
      activeResellers,
      pendingApplications,
      totalResellerRevenue
    });
  } catch (error) {
    console.error('Failed to fetch reseller stats:', error);
    return Response.json(
      { error: 'Failed to fetch reseller stats' },
      { status: 500 }
    );
  }
}