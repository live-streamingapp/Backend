import express from "express";
import {
	getAllProducts,
	getProductById,
	getProductByCode,
	createProduct,
	updateProduct,
	deleteProduct,
	addProductReview,
	getProductStats,
} from "../controllers/Product/productController.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/stats", adminMiddleware, getProductStats);
router.get("/code/:code", getProductByCode);
router.get("/:id", getProductById);

// Admin routes
router.post("/", adminMiddleware, upload.array("images", 5), createProduct);
router.put("/:id", adminMiddleware, upload.array("images", 5), updateProduct);
router.delete("/:id", adminMiddleware, deleteProduct);

// Review routes
router.post("/:id/reviews", addProductReview);

export default router;
