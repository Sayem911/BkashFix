import { User } from '@/lib/models/user.model';
import { Server as SocketIOServer } from 'socket.io';

interface NotificationOptions {
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'alert';
  metadata?: Record<string, any>;
}

export async function sendNotification({
  userId,
  title,
  message,
  type,
  metadata = {}
}: NotificationOptions) {
  try {
    // Create notification object
    const notification = {
      id: new Date().getTime().toString(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
      metadata
    };

    // Add notification to user's notifications array in database
    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          $each: [notification],
          $position: 0
        }
      }
    });

    // Get global io instance
    const io: SocketIOServer = (global as any).io;
    
    if (io) {
      // Always emit to user's specific room
      io.to(`user-${userId}`).emit('notification', notification);

      // Also emit to role-based room if applicable
      if (metadata.role === 'admin') {
        io.to('admin-room').emit('notification', notification);
      } else if (metadata.role === 'reseller') {
        io.to(`reseller-${userId}`).emit('notification', notification);
      } else if (metadata.role === 'customer') {
        io.to(`customer-${userId}`).emit('notification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}