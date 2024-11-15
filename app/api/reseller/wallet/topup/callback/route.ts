import { NextRequest } from 'next/server';
import { User } from '@/lib/models/user.model';
import { WalletTransaction } from '@/lib/models/wallet-transaction.model';
import { executeBkashPayment, queryBkashPayment } from '@/lib/bkash';
import dbConnect from '@/lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status');

    if (!paymentID || !status) {
      return Response.redirect(new URL('/reseller/wallet/error', req.url));
    }

    // Find transaction
    const transaction = await WalletTransaction.findOne({
      'metadata.paymentId': paymentID
    });

    if (!transaction) {
      console.error('Transaction not found:', paymentID);
      return Response.redirect(new URL('/reseller/wallet/error', req.url));
    }

    // Check if transaction is already processed
    if (transaction.status === 'completed') {
      return Response.redirect(new URL('/reseller/wallet/success', req.url));
    }

    if (status === 'success') {
      try {
        // Execute payment
        const paymentResult = await executeBkashPayment(paymentID);
        
        if (paymentResult.statusCode === '0000' && 
            paymentResult.transactionStatus === 'Completed') {
          // Start transaction
          const session = await WalletTransaction.startSession();
          session.startTransaction();

          try {
            // Get user
            const user = await User.findById(transaction.user);
            if (!user) {
              throw new Error('User not found');
            }

            // Update wallet balance
            const newBalance = user.wallet.balance + transaction.amount;
            user.wallet.balance = newBalance;
            user.wallet.transactions.push({
              type: 'credit',
              amount: transaction.amount,
              description: 'Wallet Top Up',
              status: 'completed'
            });

            // Update transaction
            transaction.status = 'completed';
            transaction.balance = newBalance;
            transaction.metadata = {
              ...transaction.metadata,
              transactionId: paymentResult.trxID,
              completedAt: new Date()
            };

            // Save changes
            await Promise.all([
              user.save({ session }),
              transaction.save({ session })
            ]);

            await session.commitTransaction();
            return Response.redirect(new URL('/reseller/wallet/success', req.url));
          } catch (error) {
            await session.abortTransaction();
            throw error;
          } finally {
            session.endSession();
          }
        }
      } catch (error) {
        console.error('Payment execution error:', error);
        transaction.status = 'failed';
        transaction.metadata = {
          ...transaction.metadata,
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : 'Payment execution failed'
        };
        await transaction.save();
      }
    }

    if (status === 'cancel' || status === 'failure') {
      // Update transaction status
      transaction.status = 'failed';
      transaction.metadata = {
        ...transaction.metadata,
        cancelledAt: new Date(),
        cancelReason: status === 'cancel' ? 'User cancelled the transaction' : 'Payment failed'
      };
      await transaction.save();

      // Redirect based on status
      const redirectPath = status === 'cancel' ? 'cancelled' : 'failed';
      return Response.redirect(new URL(`/reseller/wallet/${redirectPath}`, req.url));
    }

    // Default error redirect
    return Response.redirect(new URL('/reseller/wallet/error', req.url));
  } catch (error) {
    console.error('bKash callback error:', error);
    return Response.redirect(new URL('/reseller/wallet/error', req.url));
  }
}