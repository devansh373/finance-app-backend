
import express from 'express'
import { getAllUsers, getAllTransactions } from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = express.Router();


router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/transactions", authMiddleware, adminMiddleware, getAllTransactions);

export default router;
