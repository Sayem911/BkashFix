import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  reseller: mongoose.Types.ObjectId;
  domain: string;
  subdomain: string;
  name: string;
  description?: string;
  logo?: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };
  settings: {
    defaultMarkup: number;
    minimumMarkup: number;
    maximumMarkup: number;
    autoFulfillment: boolean;
    lowBalanceAlert: number;
  };
  status: 'active' | 'suspended';
  analytics: {
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  reseller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, unique: true, sparse: true },
  subdomain: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  logo: String,
  theme: {
    primaryColor: { type: String, default: '#6366f1' },
    accentColor: { type: String, default: '#4f46e5' },
    backgroundColor: { type: String, default: '#000000' }
  },
  settings: {
    defaultMarkup: { type: Number, default: 20 }, // 20% markup
    minimumMarkup: { type: Number, default: 10 },
    maximumMarkup: { type: Number, default: 50 },
    autoFulfillment: { type: Boolean, default: true },
    lowBalanceAlert: { type: Number, default: 100 } // Alert when balance < $100
  },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  analytics: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
StoreSchema.index({ reseller: 1 });
StoreSchema.index({ domain: 1 });
StoreSchema.index({ subdomain: 1 });

export const Store = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);