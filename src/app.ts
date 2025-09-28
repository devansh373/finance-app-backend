import express from "express";

import cors from "cors";
import helmet from "helmet";

import dotenv from "dotenv";


const cookieParser = require("cookie-parser");
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import adminRoutes from "./routes/adminRoutes";
import { Response } from "express";



dotenv.config();

const app = express();
app.use(cookieParser());
console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use(helmet()); 
app.use(cors({ origin: ["http://localhost:3000","https://dev-fintrade-app.netlify.app"], credentials: true })); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 



app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);


app.get("/", (res:Response) => {
  res.send("Financial Trading App API is running");
});

export default app;
