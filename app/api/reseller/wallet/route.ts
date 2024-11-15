import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id)
      .select('wallet');

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      balance: user.wallet.balance,
      currency: user.wallet.currency,
      transactions: user.wallet.transactions.slice(0, 10) // Get last 10 transactions
    });
  } catch (error) {
    console.error('Failed to fetch wallet:', error);
    return Response.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}