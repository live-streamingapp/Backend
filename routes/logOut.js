import express from "express";
const router = express.Router();

/**
 * @swagger
 * /api/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     description: |
 *       Logout the current user by clearing the authentication token cookie.
 *       This endpoint does not require authentication.
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 */
router.post("/", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ status: true, message: "Logged out successfully" });
});

export default router;
