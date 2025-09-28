"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const getAllUsers = async (_req, res) => {
    try {
        const users = await User_1.default.find().select("-password");
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
exports.getAllUsers = getAllUsers;
const getAllTransactions = async (_req, res) => {
    try {
        const txns = await Transaction_1.default.find()
            .populate("productId", "name price")
            .populate("userId", "name email");
        res.json(txns);
    }
    catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
exports.getAllTransactions = getAllTransactions;
