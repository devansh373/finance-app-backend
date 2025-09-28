import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  peRatio: number;
}

const ProductSchema = new Schema<IProduct>({
  name: String,
  category: String,
  price: Number,
  peRatio: Number
});

export default mongoose.model<IProduct>("Product", ProductSchema);
