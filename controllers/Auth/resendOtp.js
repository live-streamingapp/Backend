import PendingRegistration from "../../model/PendingRegistrationModel.js";
import { sendEmail } from "../../utils/emailService.js";

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Email is required",
        data: null,
      });
    }

    // Find pending registration
    const pendingUser = await PendingRegistration.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        status: false,
        code: 404,
        message:
          "No pending registration found for this email. Please register again.",
        data: null,
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update pending registration with new OTP
    pendingUser.otp = otp;
    pendingUser.otpExpire = otpExpire;
    await pendingUser.save();

    // Send OTP via email
    try {
      await sendEmail({
        to: email,
        subject: "New OTP - VastuGuru",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #bb1201;">OTP Resent</h2>
            <p>Hi ${pendingUser.name},</p>
            <p>Here is your new OTP to verify your email address.</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #bb1201; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">VastuGuru - Your Guide to Vastu, Astrology & Numerology</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({
        status: false,
        code: 500,
        message: "Failed to send verification email. Please try again.",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "OTP resent successfully. Please check your email.",
      data: {
        email: email,
      },
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
