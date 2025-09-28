"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = express_1.default.Router();
router.get("/users", authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.getAllUsers);
router.get("/transactions", authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, adminController_1.getAllTransactions);
exports.default = router;
