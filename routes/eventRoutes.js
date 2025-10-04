import express from "express";
import { createEvent } from "../controllers/EventManagement/CreateEvent.js";
import {
	getEventById,
	getEvents,
} from "../controllers/EventManagement/GetEvents.js";
import { updateEvent } from "../controllers/EventManagement/EditEvent.js";
import { deleteEvent } from "../controllers/EventManagement/DeleteEvent.js";
import upload from "../middlewares/upload.js";
import optionalSingleUpload from "../middlewares/optionalUpload.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post(
	"/",
	adminMiddleware,
	optionalSingleUpload("thumbnail"),
	createEvent
); // CRUD
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", adminMiddleware, upload.single("thumbnail"), updateEvent);
router.delete("/:id", adminMiddleware, deleteEvent);

export default router;
