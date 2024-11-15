import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
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

    // Get date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get reseller
    const reseller = await User.findById(params.id);
    if (!reseller || reseller.role !== 'reseller') {
      return Response.json(
        { error: 'Reseller not found' },
        { status: 404 }
      );
    }

    // Get daily revenue data
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          reseller: new ObjectId(params.id),
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$price' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate month-over-month growth
    const previousMonth = new Date(startDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            reseller: new ObjectId(params.id),
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$price' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            reseller: new ObjectId(params.id),
            status: 'completed',
            createdAt: { $gte: previousMonth, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$price' }
          }
        }
      ])
    ]);

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const previousRevenue = previousMonthRevenue[0]?.total || 0;

    const revenueGrowth = previousRevenue === 0 
      ? 100 
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    return Response.json({
      chartData: dailyRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      overview: {
        currentMonthRevenue: currentRevenue,
        previousMonthRevenue: previousRevenue,
      }
    });
  } catch (error) {
    console.error('Failed to fetch reseller analytics:', error);
    return Response.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}