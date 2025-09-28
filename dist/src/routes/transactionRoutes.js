"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const transactionController_1 = require("../controllers/transactionController");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.post("/buy", transactionController_1.buyProduct);
router.get("/portfolio", transactionController_1.getPortfolio);
router.get("/watchlist", transactionController_1.getWatchlist);
router.post("/watchlist/add", transactionController_1.addToWatchlist);
router.post("/watchlist/remove", transactionController_1.removeFromWatchlist);
exports.default = router;
