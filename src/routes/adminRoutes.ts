
import express from 'express'
import { getAllUsers, getAllTransactions, getPendingPans, updatePanStatus, deleteUser } from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = express.Router();


router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.get("/pending-kyc",authMiddleware,adminMiddleware,getPendingPans)
router.patch("/update-kyc-status/:panId",authMiddleware,adminMiddleware,updatePanStatus)
router.get("/transactions", authMiddleware, adminMiddleware, getAllTransactions);

export default router;
