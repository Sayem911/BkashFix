import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password, name, businessName, businessDescription } = await req.json();

    // Validate required fields
    if (!email || !password || !name || !businessName) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create reseller user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'reseller',
      status: 'pending',
      businessName,
      businessDescription,
      wallet: {
        balance: 0,
        currency: 'USD',
        transactions: []
      }
    });

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return Response.json(userWithoutPassword);
  } catch (error) {
    console.error('Reseller registration error:', error);
    return Response.json(
      { error: 'Failed to register reseller' },
      { status: 500 }
    );
  }
}