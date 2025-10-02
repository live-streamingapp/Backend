import crypto from "crypto";
import User from "../../model/UserModel.js";
import nodemailer from "nodemailer";

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
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // Reset URL
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey", // SendGrid requires literal string "apikey"
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const mailOptions = {
      from: `Support <${process.env.SENDGRID_EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}" target="_blank">Click here to reset your password</a></p>
        <p>This link will expire in 10 minutes.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        status: true,
        code: 200,
        message:
          "Password reset email sent successfully. Please check your inbox.",
        data: { email: user.email },
      });
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
      return res.status(500).json({
        status: false,
        code: 500,
        message: "Email could not be sent",
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
