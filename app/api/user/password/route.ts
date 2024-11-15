import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return Response.json(
        { error: 'Current and new passwords are required' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user || !user.password) {
      return Response.json(
        { error: 'User not found or no password set' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash and save the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Password update error:', error);
    return Response.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}