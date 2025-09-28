import { Request, Response } from "express";
import User from "../models/User";
import Transaction from "../models/Transaction";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllTransactions = async (_req: Request, res: Response) => {
  try {
    const txns = await Transaction.find()
      .populate("productId", "name price")
      .populate("userId", "name email");
    res.json(txns);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
