import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
	getCourseSessions,
	getStudentSessions,
	getSessionById,
	joinSession,
	leaveSession,
	getSessionRecording,
} from "../controllers/Course/SessionController.js";

const router = express.Router();

// Student session routes
router.get("/my-sessions", authMiddleware, getStudentSessions);
router.get("/:courseId/sessions", authMiddleware, getCourseSessions);
router.get("/:sessionId", authMiddleware, getSessionById); // Get single session
router.post("/:sessionId/join", authMiddleware, joinSession);
router.post("/:sessionId/leave", authMiddleware, leaveSession);
router.get("/:sessionId/recording", authMiddleware, getSessionRecording);

export default router;
