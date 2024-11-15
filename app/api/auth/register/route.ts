import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password, name, role = 'customer' } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      status: role === 'reseller' ? 'pending' : 'active',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return Response.json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}