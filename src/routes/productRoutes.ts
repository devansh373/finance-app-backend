import express from 'express'
import { getProducts, getProductById, listStocks } from "../controllers/productController";
import { fetchStockQuote } from '../controllers/newsController';

const router = express.Router();

// GET /api/stocks/search?q=HDFC
// router.get("/search", fetchStocks);
router.get("/search", listStocks);

// GET /api/stocks/quote/:symbol
router.get("/quote/:symbol", fetchStockQuote);
router.get("/", getProducts);
router.get("/:id", getProductById);


// router.post("/seed", seedProducts);

export default router;
