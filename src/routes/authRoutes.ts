import express from "express";

import { signup, login, getProfile, uploadKYC, logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../config/cloudinaryConfig"; 

const router = express.Router();


router.post("/signup", upload.single("document"), signup);

router.post("/login", login);
router.post("/logout", logout);


router.get("/profile", authMiddleware, getProfile);


export default router;
