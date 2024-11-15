import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  provider: 'bkash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentId: string;
  metadata?: {
    cartData?: any;
    userId?: string;
    cancelledAt?: Date;
    cancelReason?: string;
    refundReason?: string;
    refundedAt?: Date;
    refundedBy?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'BDT' },
  provider: { type: String, required: true, enum: ['bkash'] },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentId: { type: String, required: true },
  metadata: Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentId: 1 }, { unique: true });
PaymentSchema.index({ transactionId: 1 });

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);