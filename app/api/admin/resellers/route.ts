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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';

    // Get resellers with their statistics
    const resellers = await User.aggregate([
      {
        $match: {
          role: 'reseller',
          status
        }
      },
      {
        // Get orders for each reseller
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'reseller',
          as: 'orders'
        }
      },
      {
        // Calculate statistics
        $addFields: {
          statistics: {
            totalOrders: { $size: '$orders' },
            totalRevenue: {
              $reduce: {
                input: '$orders',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.price'] }
              }
            }
          }
        }
      },
      {
        // Remove orders array from output
        $project: {
          orders: 0,
          password: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return Response.json(resellers);
  } catch (error) {
    console.error('Failed to fetch resellers:', error);
    return Response.json(
      { error: 'Failed to fetch resellers' },
      { status: 500 }
    );
  }
}