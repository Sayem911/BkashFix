import { NextRequest } from 'next/server';
import { User } from '@/lib/models/user.model';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';

const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password, setupKey } = await req.json();

    // Verify setup key
    if (!ADMIN_SETUP_KEY || setupKey !== ADMIN_SETUP_KEY) {
      return Response.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      );
    }

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return Response.json(
        { error: 'Admin account already exists' },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    const adminUser = await User.create({
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      status: 'active'
    });

    return Response.json({ 
      success: true,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return Response.json(
      { error: 'Failed to set up admin account. Please try again.' },
      { status: 500 }
    );
  }
}