import crypto from "crypto";
import User from "../../model/UserModel.js";
import { sendPasswordResetEmail } from "../../utils/emailService.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Reset URL
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      return res.status(200).json({
        status: true,
        code: 200,
        message:
          "Password reset email sent successfully. Please check your inbox.",
        data: { email: user.email },
      });
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
      // Remove reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        status: false,
        code: 500,
        message: "Failed to send password reset email. Please try again.",
        error: mailError.message,
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Server error",
      error: error.message,
    });
  }
};
