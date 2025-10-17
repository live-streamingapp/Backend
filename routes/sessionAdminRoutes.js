import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";
import {
	createSession,
	updateSession,
	startSession,
	endSession,
	getSessionAttendance,
	uploadSessionRecording,
	removeSessionRecording,
	getAllSessions,
	deleteSession,
} from "../controllers/Admin/SessionAdminController.js";

const router = express.Router();

// Admin session management routes
router.post("/sessions", adminMiddleware, createSession);
router.put("/sessions/:sessionId", adminMiddleware, updateSession);
router.post("/sessions/:sessionId/start", adminMiddleware, startSession);
router.post("/sessions/:sessionId/end", adminMiddleware, endSession);
router.get(
	"/sessions/:sessionId/attendance",
	adminMiddleware,
	getSessionAttendance
);
router.post(
	"/sessions/:sessionId/recording",
	adminMiddleware,
	uploadSessionRecording
);
router.delete(
	"/sessions/:sessionId/recording",
	adminMiddleware,
	removeSessionRecording
);
router.get("/sessions", adminMiddleware, getAllSessions);
router.delete("/sessions/:sessionId", adminMiddleware, deleteSession);

export default router;
