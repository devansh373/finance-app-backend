"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const User_1 = __importDefault(require("../models/User"));
const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ msg: "Access denied. Admins only." });
        }
        next();
    }
    catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
exports.adminMiddleware = adminMiddleware;
