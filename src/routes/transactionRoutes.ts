import express from "express";

import { authMiddleware } from "../middleware/authMiddleware";
import {
  buyProduct,
  getPortfolio,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} from "../controllers/transactionController";

const router = express.Router();
router.use(authMiddleware);

router.post("/buy", buyProduct);


router.get("/portfolio", getPortfolio);


router.get("/watchlist", getWatchlist);
router.post("/watchlist/add", addToWatchlist);
router.post("/watchlist/remove", removeFromWatchlist);

export default router;
