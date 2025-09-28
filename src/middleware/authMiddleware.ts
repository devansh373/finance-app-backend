

import { Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { MulterRequest } from "../types/multer-request";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authMiddleware = (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    
    console.log("ts file",req.cookies)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };

    console.log(" Auth check passed");
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Unauthorized" });
  }
};
