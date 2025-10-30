import mongoose, { Schema, Document } from "mongoose";

export interface IPan extends Document {
  panNumber: string;
  panImageLink: string;
  status: string;
  user: Schema.Types.ObjectId;
}
export interface IAadhaar extends Document {
  aadhaarNumber: string;
  aadhaarImageLink: string;
  status: string;
  user: Schema.Types.ObjectId;
}
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  kyc: {
    pan:  mongoose.Types.ObjectId ;
    aadhaar:  mongoose.Types.ObjectId ;
  };
  wallet: number;
  role: "USER" | "ADMIN";
  watchlist: mongoose.Types.ObjectId[];
  // virtuals
  panDetails: IPan;
  aadhaarDetails: IAadhaar;
}

const PanSchema = new Schema<IPan>({
  panNumber: {
    type: String,
    required: true,
    unique: true,
    sparse:true,
  },
  panImageLink: {
    type: String,
    required: true,
    // unique: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Approval_Pending","Approved","Rejected"],
    default: "Pending",
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
const AadhaarSchema = new Schema<IAadhaar>({
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
    sparse:true,
  },
  aadhaarImageLink: {
    type: String,
    required: true,
    // unique: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Approval_Pending","Approved","Rejected"],
    default: "Pending",
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    kyc: {
      pan: { type: Schema.Types.ObjectId, ref: "Pan", default: null },
      aadhaar: { type: Schema.Types.ObjectId, ref: "Aadhaar", default: null },
    },
    wallet: { type: Number, default: 100000 },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    watchlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

UserSchema.virtual("panDetails", {
  ref: "Pan",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});
UserSchema.virtual("aadhaarDetails", {
  ref: "Aadhaar",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export const User = mongoose.model<IUser>("User", UserSchema);
export const Pan = mongoose.model<IPan>("Pan", PanSchema);
export const Aadhaar = mongoose.model<IAadhaar>("Aadhaar", AadhaarSchema);
