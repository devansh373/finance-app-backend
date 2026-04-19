import mongoose, { Schema, Document } from "mongoose";

// export interface IProduct extends Document {
//   name: string;
//   category: string;
//   price: number;
//   peRatio: number;
// }
export interface IProduct extends Document {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  isin: string;
  mic: string;
  shareClassFIGI: string;
  symbol: string;
  symbol2: string;
  type: string;
}

// const ProductSchema = new Schema<IProduct>({
//   name: String,
//   category: String,
//   price: Number,
//   peRatio: Number,
// });
const ProductSchema = new Schema<IProduct>({
  currency: String,
  description: String,
  displaySymbol: String,
  figi: String,
  isin: String,
  mic: String,
  shareClassFIGI: String,
  symbol: String,
  symbol2: String,
  type: String,
});

export const Product =  mongoose.model<IProduct>("Product", ProductSchema);
