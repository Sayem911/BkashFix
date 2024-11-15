import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
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

    // Get date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get store analytics
    const store = await Store.findOne({ reseller: session.user.id });
    if (!store) {
      return Response.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get daily revenue and profit data
    const dailyStats = await Order.aggregate([
      {
        $match: {
          reseller: session.user.id,
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          cost: { $sum: '$items.price' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format data for charts
    const chartData = dailyStats.map((day: any) => ({
      date: day._id,
      revenue: day.revenue,
      profit: day.revenue - day.cost,
      orders: day.orders
    }));

    // Calculate month-over-month growth
    const previousMonth = new Date(startDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentMonthStats, previousMonthStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            reseller: session.user.id,
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            cost: { $sum: '$items.price' },
            orders: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            reseller: session.user.id,
            status: 'completed',
            createdAt: { $gte: previousMonth, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            cost: { $sum: '$items.price' },
            orders: { $sum: 1 }
          }
        }
      ])
    ]);

    const current = currentMonthStats[0] || { revenue: 0, cost: 0, orders: 0 };
    const previous = previousMonthStats[0] || { revenue: 0, cost: 0, orders: 0 };

    const growth = {
      revenue: previous.revenue === 0 ? 100 : ((current.revenue - previous.revenue) / previous.revenue) * 100,
      profit: previous.cost === 0 ? 100 : (((current.revenue - current.cost) - (previous.revenue - previous.cost)) / (previous.revenue - previous.cost)) * 100,
      orders: previous.orders === 0 ? 100 : ((current.orders - previous.orders) / previous.orders) * 100
    };

    return Response.json({
      overview: {
        totalRevenue: store.analytics.totalRevenue,
        totalProfit: store.analytics.totalProfit,
        totalOrders: store.analytics.totalOrders,
        currentMonth: {
          revenue: current.revenue,
          profit: current.revenue - current.cost,
          orders: current.orders
        }
      },
      growth,
      chartData
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return Response.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}