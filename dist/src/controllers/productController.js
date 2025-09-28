"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.getProducts = exports.seedProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const redis_1 = require("../utils/redis");
const seedProducts = async (_req, res) => {
    try {
        const products = [
            { name: "Reliance Industries", category: "Stock", price: 2500, peRatio: 30 },
            { name: "HDFC Bank", category: "Stock", price: 1600, peRatio: 22 },
            { name: "SBI Mutual Fund", category: "Mutual Fund", price: 500, peRatio: 15 },
        ];
        await Product_1.default.insertMany(products);
        res.json({ msg: "Products seeded" });
    }
    catch (err) {
        res.status(500).json({ msg: "Error seeding products" });
    }
};
exports.seedProducts = seedProducts;
const getProducts = async (_req, res) => {
    try {
        const cachedProducts = await redis_1.redisClient.get("products:all");
        if (cachedProducts) {
            console.log("✅ Returning from Redis Cache");
            return res.json(JSON.parse(cachedProducts));
        }
        const products = await Product_1.default.find();
        await redis_1.redisClient.setEx("products:all", 300, JSON.stringify(products));
        console.log("✅ Products cached in Redis");
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ msg: "Error fetching products" });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product)
            return res.status(404).json({ msg: "Product not found" });
        const chartData = [
            { date: "2025-01-01", value: product.price - 100 },
            { date: "2025-02-01", value: product.price - 50 },
            { date: "2025-03-01", value: product.price },
        ];
        res.json({ product, chartData });
    }
    catch (err) {
        res.status(500).json({ msg: "Error fetching product" });
    }
};
exports.getProductById = getProductById;
