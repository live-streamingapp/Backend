import express from "express";
import {
	getTestimonials,
	getAdminTestimonials,
	getTestimonialById,
	createTestimonial,
	updateTestimonial,
	deleteTestimonial,
	approveTestimonial,
	rejectTestimonial,
} from "../controllers/Testimonial/testimonialController.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Public routes
router.get("/testimonials", getTestimonials);

// Admin routes (require authentication)
router.get("/admin/testimonials", adminMiddleware, getAdminTestimonials);
router.get("/admin/testimonials/:id", adminMiddleware, getTestimonialById);
router.post("/admin/testimonials", adminMiddleware, createTestimonial);
router.put("/admin/testimonials/:id", adminMiddleware, updateTestimonial);
router.delete("/admin/testimonials/:id", adminMiddleware, deleteTestimonial);
router.patch(
	"/admin/testimonials/:id/approve",
	adminMiddleware,
	approveTestimonial
);
router.patch(
	"/admin/testimonials/:id/reject",
	adminMiddleware,
	rejectTestimonial
);

export default router;
