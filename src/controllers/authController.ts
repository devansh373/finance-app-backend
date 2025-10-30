import { Request, Response } from "express";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

import { Pan, User } from "../models/User";
import { MulterRequest } from "../types/multer-request";
import { PrismaClient } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);

export const signup = async (req: MulterRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "All fields including document are required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ msg: "Email already registered" });

    const hashedPw = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPw,
      wallet: 100000,
      watchlist: [],
      // kyc: { pan: null, aadhaar: null },
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, {
      // sameSite: "none",
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60,
    });

    res.status(201).json({
      success: true,
      msg: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        kycStatus: {
          pan: "Pending",
          aadhaar: "Pending",
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// export const verifyPan = async (req: any, res: any) => {
//   try {
//     const { panNumber } = req.body;
//     const user = req.user; // from auth middleware

//     if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
//       return res.status(400).json({ msg: "Invalid PAN format" });
//     }

//     // Optional: check duplicate PAN
//     const existing = await User.findOne({ panNumber });
//     if (existing && existing._id.toString() !== user._id.toString()) {
//       return res.status(400).json({ msg: "PAN already used" });
//     }

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     user.kyc.pan = {
//       panNumber,
//       panImageLink: "",
//       status: "Approval_Pending",
//       user,
//     };
//     await user.save();

//     res.json({ success: true, msg: "PAN verified", user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// let otpStore: Record<string, string> = {}; // simple in-memory store for demo

export const submitPan = async (req: any, res: any) => {
  try {
    const { panNumber } = req.body;
    const path = (req as any).file.path;
    const user = req.user; // from auth middleware
    console.log(req.user);

    if (
      !panNumber ||
      !req.file ||
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)
    ) {
      return res.status(400).json({ msg: "Invalid PAN format" });
    }

    // Optional: check duplicate PAN across users
    const existing = await Pan.findOne({ panNumber });
    if (existing && existing.user.toString() !== user.id.toString()) {
      return res.status(400).json({ msg: "PAN already used" });
    }

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Create a new Pan document
    const panDoc = await Pan.create({
      panNumber,
      panImageLink: path, // TODO: handle file upload via multer + cloudinary
      status: "Approval_Pending",
      user: user.id,
    });

    // Link panDoc to user
    const userToUpdate = await User.findOne({ _id: user.id });
    if (!userToUpdate) return res.status(404).json({ msg: "User not found" });
    if (panDoc._id) userToUpdate.kyc.pan = (panDoc as any)._id;
    await userToUpdate.save();

    res.json({ success: true, msg: "PAN submitted", pan: panDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const sendAadhaarOtp = async (req: any, res: any) => {
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    return res.status(400).json({ msg: "Invalid Aadhaar number" });
  }

  const otp = "123456"; // static OTP for demo
  // otpStore[userId] = otp;

  res.json({ success: true, msg: "OTP sent (simulated)", otp }); // otp in response for demo
};

export const verifyAadhaarOtp = async (req: any, res: any) => {
  const { aadhaarNumber } = req.body;
  const user = req.user;

  // if (otpStore[userId] !== otp) {
  //   return res.status(400).json({ msg: "Invalid OTP" });
  // }

  if (!user) return res.status(404).json({ msg: "User not found" });

  user.kyc.aadhaar = {
    aadhaarNumber,
    aadhaarImageLink: "",
    status: "Approved",
    user,
  };

  await user.save();

  // delete otpStore[userId];

  res.json({ success: true, msg: "Aadhaar verified. KYC complete!", user });
};

export const verifyAadhaar = async (req: any, res: any) => {
  try {
    const { panNumber } = req.body;
    const user = req.user; // from auth middleware

    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return res.status(400).json({ msg: "Invalid PAN format" });
    }

    // Optional: check duplicate PAN
    // const existing = await Pan.findOne({ panNumber });
    // if (existing && existing._id.toString() !== user._id.toString()) {
    //   return res.status(400).json({ msg: "PAN already used" });
    // }

    if (!user) return res.status(404).json({ msg: "User not found" });

    user.kyc.pan = {
      panNumber,
      panImageLink: "",
      status: "Approved",
      user,
    };
    await user.save();

    res.json({ success: true, msg: "PAN verified", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("kyc.pan", "status");
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    // console.log(token)

    res.cookie("token", token, {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      maxAge: 1000 * 60 * 60,
    });

    res.json({
      success: true,
      msg: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
        kyc: user.kyc,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// export const uploadKYC = async (req: MulterRequest, res: Response) => {
//   try {
//     if (!req.file) return res.status(400).json({ msg: "No document uploaded" });

//     const user = await User.findById(req.user?.id);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     user.kycDocumentPath = (req.file as any).path;
//     await user.save();

//     res.json({
//       msg: "KYC uploaded successfully",
//       kycUrl: user.kycDocumentPath,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// export const getProfile = async (req: any, res: Response) => {
//   try {
//     const user = await User.findById(req.user.id)
//       .select("-password")
//       .populate("kyc.pan");
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json({
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       wallet: user.wallet,
//       kyc: user.kyc,
//       watchlist: user.watchlist,
//     });
//   } catch (err: any) {
//     res.status(500).json({ msg: err.message || "Server error" });
//   }
// };

const prisma = new PrismaClient();


export const getProfile = async (req: any, res: Response) => {
  try {
    // 1️⃣ Fetch user from MongoDB
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("kyc.pan");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 2️⃣ Get or create the SQL wallet for this user
    // This ensures a wallet record exists even for new users
    let wallet = await prisma.wallet.findFirst({
      where: { userId: user._id?.toString() },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user._id?.toString()!,
          balance: 100000, // Default balance from your buyProduct logic
        },
      });
    }

    // 3️⃣ Respond with Mongo user data + SQL wallet data
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      // 👇 Replaced user.wallet with the live wallet from PostgreSQL
      wallet: {
        ...wallet,
        balance: Number(wallet.balance) // Ensure balance is a number
      }, 
      kyc: user.kyc,
      watchlist: user.watchlist,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
};

export const logout = (_req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.json({ sucess: true, msg: "Logged out successfully" });
  } catch (err) {
    if (err instanceof Error) res.json({ success: false, msg: err.message });
  }
};
