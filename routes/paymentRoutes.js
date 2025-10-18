import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
	initiatePayU,
	payUCallback,
	verifyPayUHash,
	payUReturn,
	verifyOrderWithPayU,
} from "../controllers/Payments/payuController.js";

const router = Router();

// Initiate payment for current user's cart-only checkout
router.post("/payu/initiate", authMiddleware, initiatePayU);

// PayU posts the result to this callback URL (success or failure), no webhooks
router.post("/payu/callback", payUCallback);
// Some PayU flows or user clicks hit GET; handle gracefully by redirecting to client
router.get("/payu/callback", payUReturn);

// Optional: client can call verify with posted fields to double-check hash
router.post("/payu/verify", verifyPayUHash);

// Fallback: verify a specific order with PayU using txnid stored on our order
router.get("/payu/verify-order/:orderId", authMiddleware, verifyOrderWithPayU);

export default router;
