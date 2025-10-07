import { Router } from "express";
import { createOrder } from "../controllers/Order/CreateOrder.js";
import {
	getOrders,
	getOrderById,
	getMyOrders,
} from "../controllers/Order/GetOrders.js";
import {
	updateOrderStatus,
	updatePaymentStatus,
} from "../controllers/Order/UpdateOrder.js";
import { enrollCoursesFromPaidOrders } from "../controllers/Order/EnrollCoursesFromPaidOrders.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = Router();

// Student routes
router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);

// Admin routes
router.get("/", adminMiddleware, getOrders);
router.put("/:id/status", adminMiddleware, updateOrderStatus);
router.put("/:id/payment", adminMiddleware, updatePaymentStatus);

// Utility route - enroll users from existing paid orders (admin only)
router.post(
	"/utility/enroll-courses",
	adminMiddleware,
	enrollCoursesFromPaidOrders
);

export default router;
