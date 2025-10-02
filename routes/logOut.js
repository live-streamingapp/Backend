import express from "express";
const router = express.Router();

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
