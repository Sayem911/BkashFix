import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      revenueData
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      Order.aggregate([
        {
          $match: {
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' }
          }
        }
      ])
    ]);

    return Response.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenueData[0]?.total || 0
    });
  } catch (error) {
    console.error('Failed to fetch order stats:', error);
    return Response.json(
      { error: 'Failed to fetch order stats' },
      { status: 500 }
    );
  }
}