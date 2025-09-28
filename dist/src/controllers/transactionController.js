"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWatchlist = exports.addToWatchlist = exports.getWatchlist = exports.getPortfolio = exports.buyProduct = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const User_1 = __importDefault(require("../models/User"));
const Product_1 = __importDefault(require("../models/Product"));
const buyProduct = async (req, res) => {
    try {
        const { productId, units } = req.body;
        const user = await User_1.default.findById(req.user.id);
        const product = await Product_1.default.findById(productId);
        if (!user || !product)
            return res.status(404).json({ msg: "User/Product not found" });
        const totalAmount = product.price * units;
        if (user.wallet < totalAmount) {
            return res.status(400).json({ msg: "Insufficient balance" });
        }
        user.wallet -= totalAmount;
        await user.save();
        const txn = new Transaction_1.default({
            userId: user._id,
            productId,
            units,
            priceAtTxn: product.price,
            totalAmount,
            type: "BUY",
        });
        await txn.save();
        res.json({ msg: "Purchase successful", txn });
    }
    catch (err) {
        res.status(500).json({ msg: "Error buying product" });
    }
};
exports.buyProduct = buyProduct;
const getPortfolio = async (req, res) => {
    try {
        const txns = await Transaction_1.default.find({ userId: req.user.id }).populate("productId");
        let invested = 0;
        let currentValue = 0;
        txns.forEach((txn) => {
            invested += txn.totalAmount;
            currentValue += txn.units * txn.productId.price;
        });
        const returns = currentValue - invested;
        res.json({ invested, currentValue, returns, transactions: txns });
    }
    catch (err) {
        res.status(500).json({ msg: "Error fetching portfolio" });
    }
};
exports.getPortfolio = getPortfolio;
const getWatchlist = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).populate("watchlist");
        if (!user)
            return res.status(404).json({ msg: "User not found" });
        res.json(user.watchlist);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error fetching watchlist" });
    }
};
exports.getWatchlist = getWatchlist;
const addToWatchlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: "User not found" });
        if (!user.watchlist.includes(productId)) {
            user.watchlist.push(productId);
            await user.save();
        }
        res.json({ msg: "Added to watchlist", watchlist: user.watchlist });
    }
    catch (err) {
        res.status(500).json({ msg: "Error updating watchlist" });
    }
};
exports.addToWatchlist = addToWatchlist;
const removeFromWatchlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: "User not found" });
        user.watchlist = user.watchlist.filter((id) => id.toString() !== productId);
        await user.save();
        res.json({ msg: "Removed from watchlist", watchlist: user.watchlist });
    }
    catch (err) {
        res.status(500).json({ msg: "Error updating watchlist" });
    }
};
exports.removeFromWatchlist = removeFromWatchlist;
