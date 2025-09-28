import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  pan: string;
  kycDocumentPath?: string;
  wallet: number;
  role: "USER" | "ADMIN";
   watchlist: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    pan: { type: String, unique: true, required: true },
    kycDocumentPath: { type: String },
    wallet: { type: Number, default: 100000 },
    role: { type: String, default: "USER" },
    watchlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
