import express from "express";

import { signup, login, getProfile,  logout, submitPan, verifyAadhaar } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../config/cloudinaryConfig"; 

const router = express.Router();


router.post("/signup", upload.single("document"), signup);
router.post("/kyc/pan",authMiddleware,upload.single("panImage"),submitPan)
router.post("/kyc/aadhaar",authMiddleware,upload.single("aadhaarImage"),verifyAadhaar)

router.post("/login", login);
router.post("/logout", logout);


router.get("/profile", authMiddleware, getProfile);


export default router;
