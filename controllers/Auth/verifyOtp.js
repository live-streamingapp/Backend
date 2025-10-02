import jwt from "jsonwebtoken";
import User from "../../model/UserModel.js";

export const verifyOtp = async (req, res) => {
  try {
    const { token, otp } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "User already verified",
        data: null,
      });
    }

    // Check if OTP has expired
    if (user.otpExpire < new Date()) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "OTP has expired",
        data: null,
      });
    }

    // Check OTP
    if (user.otp !== parseInt(otp, 10)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Invalid OTP",
        data: null,
      });
    }

    // Mark verified
    user.verified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Email verified successfully",
      data: { email: user.email },
    });
  } catch (err) {
    console.error("OTP verification error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Verification token expired",
        data: null,
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Invalid verification token",
        data: null,
      });
    }

    res.status(500).json({
      status: false,
      code: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};
