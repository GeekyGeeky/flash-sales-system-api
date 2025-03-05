import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  saleId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  purchaseTime: Date;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseTime: {
      type: Date,
      default: Date.now,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create indexes for frequently queried fields
PurchaseSchema.index({ userId: 1, saleId: 1 });
PurchaseSchema.index({ saleId: 1, purchaseTime: 1 });

export default mongoose.model<IPurchase>("Purchase", PurchaseSchema);
