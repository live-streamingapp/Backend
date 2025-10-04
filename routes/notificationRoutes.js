import express from "express";
import {
	getNotifications,
	getNotificationById,
} from "../controllers/Notification/GetNotifications.js";
import {
	createNotification,
	createBulkNotifications,
} from "../controllers/Notification/CreateNotification.js";
import {
	markAsRead,
	markAllAsRead,
} from "../controllers/Notification/UpdateNotification.js";
import {
	deleteNotification,
	deleteAllNotifications,
} from "../controllers/Notification/DeleteNotification.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Get all notifications for a user (requires auth)
router.get("/", authMiddleware, getNotifications);

// Get single notification by ID
router.get("/:id", authMiddleware, getNotificationById);

// Create notification (admin only)
router.post("/", adminMiddleware, createNotification);

// Create bulk notifications (admin only)
router.post("/bulk", adminMiddleware, createBulkNotifications);

// Mark notification as read
router.patch("/:id/read", authMiddleware, markAsRead);

// Mark all notifications as read for a user
router.patch("/read-all", authMiddleware, markAllAsRead);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

// Delete all notifications for a user
router.delete("/", authMiddleware, deleteAllNotifications);

export default router;
