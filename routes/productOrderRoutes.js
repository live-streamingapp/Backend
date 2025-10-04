import express from "express";
import {
	getAllProductOrders,
	getProductOrderById,
	getProductOrderByOrderId,
	createProductOrder,
	updateOrderStatus,
	updateProductOrder,
	deleteProductOrder,
	getProductOrderStats,
} from "../controllers/ProductOrder/productOrderController.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminMiddleware);

// Statistics route (must be before /:id route)
router.get("/stats", getProductOrderStats);

// Get order by order ID
router.get("/order/:orderId", getProductOrderByOrderId);

// CRUD routes
router.route("/").get(getAllProductOrders).post(createProductOrder);

router
	.route("/:id")
	.get(getProductOrderById)
	.put(updateProductOrder)
	.delete(deleteProductOrder);

// Update order status route
router.put("/:id/status", updateOrderStatus);

export default router;
