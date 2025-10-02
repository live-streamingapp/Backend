import express from "express";
import upload from "../middlewares/upload.js";
import { createBanner } from "../controllers/Banner/CreateBanner.js";
import { getBannerById, getBanners } from "../controllers/Banner/GetBanner.js";
import { updateBanner } from "../controllers/Banner/UpdateBanner.js";
import { deleteBanner } from "../controllers/Banner/DeleteBanner.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/", adminMiddleware, upload.single("image"), createBanner);
router.get("/", getBanners);
router.get("/:id", getBannerById);
router.put("/:id", adminMiddleware, upload.single("image"), updateBanner);
router.delete("/:id", adminMiddleware, deleteBanner);

export default router;
