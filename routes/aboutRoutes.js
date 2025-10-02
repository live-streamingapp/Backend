import express from "express";
import { getAboutUs } from "../controllers/AboutUs/GetAboutUs.js";
import upload from "../middlewares/upload.js";
import { updateAboutUs } from "../controllers/AboutUs/UpdateAboutUs.js";
import { adminMiddleware } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", getAboutUs);
router.put("/", adminMiddleware, upload.single("image"), updateAboutUs);

export default router;
