import express from "express";
import { registerUser } from "../controllers/Auth/register.js";
import { login } from "../controllers/Auth/login.js";
import { verifyOtp } from "../controllers/Auth/verifyOtp.js";
import { forgotPassword } from "../controllers/Auth/forgotPassword.js";
import { resetPassword } from "../controllers/Auth/resetPassword.js";
import { updateProfile } from "../controllers/Auth/updateProfile.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put(
	"/update-profile",
	authMiddleware,
	upload.single("profileImage"),
	updateProfile
);

export default router;
