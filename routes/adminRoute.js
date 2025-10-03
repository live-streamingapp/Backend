import express from "express";
import { getUsers } from "../controllers/Admin/getUsers.js";
import { getStudentReports } from "../controllers/Admin/getStudentReports.js";
import { getStudentBookings } from "../controllers/Admin/getStudentBookings.js";
import { getStudentProgress } from "../controllers/Admin/getStudentProgress.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// All admin routes now use the unified auth system
// Users with role "admin" or "astrologer" can access these routes
router.get("/users", adminMiddleware, getUsers);
router.get("/students/reports", adminMiddleware, getStudentReports);
router.get("/students/bookings", adminMiddleware, getStudentBookings);
router.get("/students/progress", adminMiddleware, getStudentProgress);

export default router;
