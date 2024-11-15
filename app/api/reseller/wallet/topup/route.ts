import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { User } from '@/lib/models/user.model';
import { WalletTransaction } from '@/lib/models/wallet-transaction.model';
import { createBkashPayment } from '@/lib/bkash';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'reseller') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount } = await req.json();
    if (!amount || amount <= 0) {
      return Response.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create bKash payment
    const bkashPayment = await createBkashPayment(
      amount,
      `wallet-topup-${session.user.id}-${Date.now()}`
    );

    // Create transaction record
    const transaction = await WalletTransaction.create({
      user: session.user.id,
      type: 'credit',
      amount,
      balance: 0, // Will be updated after payment completion
      description: 'Wallet Top Up',
      status: 'pending',
      metadata: {
        paymentId: bkashPayment.paymentID,
        initiatedAt: new Date()
      }
    });

    return Response.json({
      transactionId: transaction._id,
      bkashURL: bkashPayment.bkashURL
    });
  } catch (error) {
    console.error('Failed to initiate top-up:', error);
    return Response.json(
      { error: 'Failed to initiate top-up' },
      { status: 500 }
    );
  }
}