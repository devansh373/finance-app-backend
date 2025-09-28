import { Request, Response } from "express";
import Product from "../models/Product";
import { redisClient } from "../utils/redis";


export const seedProducts = async (_req: Request, res: Response) => {
  try {
    const products = [
      { name: "Reliance Industries", category: "Stock", price: 2500, peRatio: 30 },
      { name: "HDFC Bank", category: "Stock", price: 1600, peRatio: 22 },
      { name: "SBI Mutual Fund", category: "Mutual Fund", price: 500, peRatio: 15 },
    ];

    await Product.insertMany(products);
    res.json({ msg: "Products seeded" });
  } catch (err) {
    res.status(500).json({ msg: "Error seeding products" });
  }
};



export const getProducts = async (_req: Request, res: Response) => {
  try {
    const cachedProducts = await redisClient.get("products:all");
    if (cachedProducts) {
      console.log("✅ Returning from Redis Cache");
      return res.json(JSON.parse(cachedProducts as string));
    }

    const products = await Product.find();

    await redisClient.setEx("products:all", 300, JSON.stringify(products));

    console.log("✅ Products cached in Redis");
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching products" });
  }
};



export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    
    const chartData = [
      { date: "2025-01-01", value: product.price - 100 },
      { date: "2025-02-01", value: product.price - 50 },
      { date: "2025-03-01", value: product.price },
    ];

    res.json({ product, chartData });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching product" });
  }
};
