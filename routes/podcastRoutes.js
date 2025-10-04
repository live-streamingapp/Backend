import express from "express";
import {
	addPodcast,
	deletePodcast,
	getPodcasts,
	getPodcastById,
	updatePodcast,
} from "../controllers/Podcast/Podcast.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/", adminMiddleware, addPodcast);
router.get("/", getPodcasts);
router.get("/:id", getPodcastById);
router.put("/:id", adminMiddleware, updatePodcast);
router.delete("/:id", adminMiddleware, deletePodcast);

export default router;
