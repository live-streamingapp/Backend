import { Router } from "express";
import upload from "../middlewares/upload.js";
import { createService } from "../controllers/Service/CreateService.js";
import {
	getServices,
	getServiceById,
} from "../controllers/Service/GetServices.js";
import { updateService } from "../controllers/Service/UpdateService.js";
import { deleteService } from "../controllers/Service/DeleteService.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = Router();

// Public routes
router.get("/", getServices);
router.get("/:id", getServiceById);

// Admin routes
router.post(
	"/",
	adminMiddleware,
	upload.fields([{ name: "image", maxCount: 1 }]),
	createService
);

router.put(
	"/:id",
	adminMiddleware,
	upload.fields([{ name: "image", maxCount: 1 }]),
	updateService
);

router.delete("/:id", adminMiddleware, deleteService);

export default router;
