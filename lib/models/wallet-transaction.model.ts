import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: {
    orderId?: string;
    paymentId?: string;
    refundId?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true }, // Balance after transaction
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
WalletTransactionSchema.index({ user: 1, createdAt: -1 });
WalletTransactionSchema.index({ status: 1 });

export const WalletTransaction = mongoose.models.WalletTransaction || 
  mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);