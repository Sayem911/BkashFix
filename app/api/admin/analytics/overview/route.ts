import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === 'admin') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the last 7 days of data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // Format dates for aggregation
    const startDate = last7Days[0];
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = last7Days[last7Days.length - 1];
    endDate.setHours(23, 59, 59, 999);

    // Aggregate orders data
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'processing'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$price' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Format data for the chart
    const data = last7Days.map(date => {
      const dayData = orders.find(order => 
        order._id.year === date.getFullYear() &&
        order._id.month === date.getMonth() + 1 &&
        order._id.day === date.getDate()
      );

      return {
        name: date.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric'
        }),
        revenue: dayData?.revenue || 0,
        orders: dayData?.orders || 0
      };
    });

    return Response.json({ data });
  } catch (error) {
    console.error('Failed to fetch overview data:', error);
    return Response.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}