import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      status: true,
      code: 200,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      code: 500,
      message: "Failed to fetch user info",
      error: err.message,
    });
  }
});

export default router;
