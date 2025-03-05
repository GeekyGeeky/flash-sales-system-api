import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
  productId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date | null;
  totalUnits: number;
  remainingUnits: number;
  isActive: boolean;
  maxPurchasePerUser: number;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    totalUnits: {
      type: Number,
      required: true,
      default: 200,
      min: 1,
    },
    remainingUnits: {
      type: Number,
      required: true,
      default: 200,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    maxPurchasePerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create indexes for frequently queried fields
SaleSchema.index({ isActive: 1 });
SaleSchema.index({ startTime: 1 });
SaleSchema.index({ productId: 1, isActive: 1 });

export default mongoose.model<ISale>('Sale', SaleSchema);
