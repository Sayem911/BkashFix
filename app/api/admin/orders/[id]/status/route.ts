import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Order } from '@/lib/models/order.model';
import { User } from '@/lib/models/user.model';
import { sendNotification } from '@/lib/send-notification';
import dbConnect from '@/lib/db/mongodb';

export async function PATCH(
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

    const { status } = await req.json();
    if (!['pending', 'processing', 'completed', 'failed'].includes(status)) {
      return Response.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get order with populated customer and reseller
    const order = await Order.findById(params.id)
      .populate('customer', 'name email')
      .populate('reseller', '_id');

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    order.status = status;
    await order.save();

    // Send notification to customer
    await sendNotification({
      userId: order.customer._id.toString(),
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} has been ${status}`,
      type: 'order',
      metadata: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status,
        role: 'customer'
      }
    });

    // Send notification to all admin users
    const adminUsers = await User.find({ role: 'admin' });
    await Promise.all(adminUsers.map(admin => 
      sendNotification({
        userId: admin._id.toString(),
        title: 'Order Status Updated',
        message: `Order #${order.orderNumber} has been marked as ${status}`,
        type: 'order',
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status,
          updatedBy: session.user.id,
          role: 'admin'
        }
      })
    ));

    // Send notification to reseller if exists
    if (order.reseller) {
      await sendNotification({
        userId: order.reseller._id.toString(),
        title: 'Order Status Updated',
        message: `Order #${order.orderNumber} has been marked as ${status}`,
        type: 'order',
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status,
          role: 'reseller'
        }
      });
    }

    return Response.json(order);
  } catch (error) {
    console.error('Failed to update order status:', error);
    return Response.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}