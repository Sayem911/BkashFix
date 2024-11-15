import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { password } = await req.json();
    if (!password) {
      return Response.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Find user by email instead of ID for Google auth users
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only allow password setup for users without a password
    if (user.password) {
      return Response.json(
        { error: 'Password is already set up' },
        { status: 400 }
      );
    }

    // Hash and save the new password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Password setup error:', error);
    return Response.json(
      { error: 'Failed to set up password' },
      { status: 500 }
    );
  }
}