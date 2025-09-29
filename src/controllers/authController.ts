import { Request, Response } from "express";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

import User from "../models/User";
import { MulterRequest } from "../types/multer-request";

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);

export const signup = async (req: MulterRequest, res: Response) => {
  try {
    const { name, email, password, panNumber } = req.body;

    if (!name || !email || !password || !panNumber || !req.file) {
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
      pan: panNumber,
      wallet: 100000,
      kycDocumentPath: (req.file as any).path,
      watchlist: [],
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, {
      sameSite: "none",
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
        kycCompleted: true,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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
        kycCompleted: !!user.kycDocumentPath,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const uploadKYC = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No document uploaded" });

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.kycDocumentPath = (req.file as any).path;
    await user.save();

    res.json({
      msg: "KYC uploaded successfully",
      kycUrl: user.kycDocumentPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      kycCompleted: !!user.kycDocumentPath,
      watchlist: user.watchlist,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
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
