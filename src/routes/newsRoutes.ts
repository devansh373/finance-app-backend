// import { Router } from "express";
// import { getNewsSentiment } from "../controllers/newsController";

// const router = Router();
// router.get("/newsSentiment", getNewsSentiment);
// export default router ;

import express from "express";
import { 
    // fetchCompanyNews,
     fetchMarketNews, fetchStockNewsWithSentiment } from "../controllers/newsController";

const router = express.Router();

// GET /api/news?category=general
router.get("/", fetchMarketNews);

// router.get("/company/:symbol", fetchCompanyNews);
router.get("/company/:symbol", fetchStockNewsWithSentiment);

// GET /api/news/sentiment/:symbol
// router.get("/sentiment/:symbol", fetchStockSentiment);

export default router;
