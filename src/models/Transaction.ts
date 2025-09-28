import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  units: number;
  priceAtTxn: number;
  totalAmount: number;
  type: "BUY";
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  units: Number,
  priceAtTxn: Number,
  totalAmount: Number,
  type: { type: String, enum: ["BUY"], default: "BUY" }
}, { timestamps: true });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
