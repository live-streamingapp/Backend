import express from "express";
import {
	getAllConsultations,
	getConsultationById,
	createConsultation,
	updateConsultation,
	deleteConsultation,
	getConsultationStats,
} from "../controllers/Consultation/consultationController.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminMiddleware);

// Statistics route (must be before /:id route)
router.get("/stats", getConsultationStats);

// CRUD routes
router.route("/").get(getAllConsultations).post(createConsultation);

router
	.route("/:id")
	.get(getConsultationById)
	.put(updateConsultation)
	.delete(deleteConsultation);

export default router;
