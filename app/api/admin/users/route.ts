import { NextRequest } from 'next/server';
import { User } from '@/lib/models/user.model';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 });

    return Response.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}