import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/me:
 *   get:
 *     tags: [User]
 *     summary: Get current user
 *     description: |
 *       Get the currently authenticated user's information.
 *       Requires authentication via cookie token.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5ec49f1b2c8b1f8c8e8e8"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     role:
 *                       type: string
 *                       enum: [student, astrologer, admin]
 *                       example: "student"
 *       401:
 *         description: Unauthorized - not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch user info"
 */
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
