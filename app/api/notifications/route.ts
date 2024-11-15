import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

// Get user's notifications
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id)
      .select('notifications')
      .sort({ 'notifications.createdAt': -1 })
      .limit(50);

    return Response.json(user?.notifications || []);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return Response.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notificationIds } = await req.json();
    
    await User.updateOne(
      { _id: session.user.id },
      { 
        $set: { 
          'notifications.$[elem].read': true 
        } 
      },
      { 
        arrayFilters: [{ 'elem._id': { $in: notificationIds } }] 
      }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return Response.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}