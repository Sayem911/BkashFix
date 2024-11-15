import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  reseller?: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    subProductName: string;
    metadata?: Record<string, any>;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  payment?: {
    provider: string;
    transactionId: string;
    amount: number;
    currency: string;
    paymentId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reseller: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    subProductName: {
      type: String,
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  payment: {
    provider: String,
    transactionId: String,
    amount: Number,
    currency: String,
    paymentId: String
  }
}, {
  timestamps: true
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);