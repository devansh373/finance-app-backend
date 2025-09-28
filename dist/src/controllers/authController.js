"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getProfile = exports.uploadKYC = exports.login = exports.signup = void 0;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);
const signup = async (req, res) => {
    try {
        const { name, email, password, panNumber } = req.body;
        if (!name || !email || !password || !panNumber || !req.file) {
            return res.status(400).json({ msg: "All fields including document are required" });
        }
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ msg: "Email already registered" });
        const hashedPw = await bcrypt.hash(password, 10);
        const user = new User_1.default({
            name,
            email,
            password: hashedPw,
            pan: panNumber,
            wallet: 100000,
            kycDocumentPath: req.file.path,
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ msg: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: "Invalid credentials" });
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        // console.log(token)
        res.cookie("token", token, {
            sameSite: "none",
            // sameSite: "strict",
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};
exports.login = login;
const uploadKYC = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ msg: "No document uploaded" });
        const user = await User_1.default.findById(req.user?.id);
        if (!user)
            return res.status(404).json({ msg: "User not found" });
        user.kycDocumentPath = req.file.path;
        await user.save();
        res.json({
            msg: "KYC uploaded successfully",
            kycUrl: user.kycDocumentPath,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};
exports.uploadKYC = uploadKYC;
const getProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select("-password");
        if (!user)
            return res.status(404).json({ msg: "User not found" });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            wallet: user.wallet,
            kycCompleted: !!user.kycDocumentPath,
            watchlist: user.watchlist,
        });
    }
    catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
exports.getProfile = getProfile;
const logout = (_req, res) => {
    try {
        res.clearCookie("token");
        res.json({ sucess: true, msg: "Logged out successfully" });
    }
    catch (err) {
        if (err instanceof Error)
            res.json({ success: false, msg: err.message });
    }
};
exports.logout = logout;
