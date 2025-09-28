import express from 'express'
import { getProducts, getProductById, seedProducts } from "../controllers/productController";

const router = express.Router();


router.get("/", getProducts);
router.get("/:id", getProductById);


// router.post("/seed", seedProducts);

export default router;
