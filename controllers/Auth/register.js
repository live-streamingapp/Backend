import User from "../../model/UserModel.js";
import PendingRegistration from "../../model/PendingRegistrationModel.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../../utils/emailService.js";

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------------- REGISTER ----------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, dob, password, role } = req.body;

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "This email is already registered",
        data: null,
      });
    }

    // Check if there's already a pending registration for this email
    const existingPending = await PendingRegistration.findOne({ email });
    if (existingPending) {
      // Delete the old pending registration
      await PendingRegistration.findByIdAndDelete(existingPending._id);
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Password must be at least 8 characters long",
        data: null,
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Password must contain at least one uppercase letter",
        data: null,
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Password must contain at least one number",
        data: null,
      });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message:
          "Password must contain at least one special character (!@#$%^&*)",
        data: null,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Allow student or astrologer registration
    const userRole = role === "astrologer" ? "astrologer" : "student";

    // Create pending registration
    const pendingRegistration = await PendingRegistration.create({
      name,
      email,
      phone,
      dob,
      password: hashPassword,
      role: userRole,
      otp,
      otpExpire,
    });

    // Send OTP via email
    try {
      await sendEmail({
        to: email,
        subject: "Verify Your Email - VastuGuru",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #bb1201;">Welcome to VastuGuru!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering. Please verify your email address to complete your registration.</p>
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
      // Delete pending registration if email fails
      await PendingRegistration.findByIdAndDelete(pendingRegistration._id);
      return res.status(500).json({
        status: false,
        code: 500,
        message: "Failed to send verification email. Please try again.",
        data: null,
      });
    }

    // Success response
    res.status(201).json({
      status: true,
      code: 201,
      message:
        "Registration initiated. Please check your email for OTP verification.",
      data: {
        email: email,
        message:
          "OTP sent to your email. Please verify to complete registration.",
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
