import {  Response, NextFunction } from "express";
import {User} from "../models/User";

export const adminMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
