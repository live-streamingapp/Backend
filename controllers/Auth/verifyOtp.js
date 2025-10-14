import jwt from "jsonwebtoken";
import User from "../../model/UserModel.js";
import PendingRegistration from "../../model/PendingRegistrationModel.js";

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });
};

export const verifyOtp = async (req, res) => {
  try {
    let { email, otp, token: verificationToken } = req.body;

    // Support both old flow (with token) and new flow (with email directly)
    // This allows gradual frontend migration
    if (verificationToken && !email) {
      try {
        const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
        // Token might contain email or user ID
        if (decoded.email) {
          email = decoded.email;
        } else {
          // If token has ID, try to find pending registration by ID (for backwards compatibility)
          const pendingById = await PendingRegistration.findById(decoded.id);
          if (pendingById) {
            email = pendingById.email;
          }
        }
      } catch (tokenError) {
        console.error("Token decode error:", tokenError);
        return res.status(400).json({
          status: false,
          code: 400,
          message:
            "Invalid or expired verification token. Please register again.",
          data: null,
        });
      }
    }

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Email and OTP are required",
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

    // Check if OTP has expired
    if (pendingUser.otpExpire < new Date()) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "OTP has expired. Please request a new OTP.",
        data: null,
      });
    }

    // Check OTP (compare as strings)
    if (pendingUser.otp !== otp.toString()) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Invalid OTP. Please try again.",
        data: null,
      });
    }

    // OTP is valid - Create the actual user account
    const newUser = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      phone: pendingUser.phone,
      dob: pendingUser.dob,
      password: pendingUser.password, // Already hashed
      role: pendingUser.role,
    });

    // Delete the pending registration
    await PendingRegistration.findByIdAndDelete(pendingUser._id);

    // Generate JWT token for the new user
    const token = generateToken(newUser._id, newUser.role);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Always true on Vercel (HTTPS enforced)
      sameSite: "none", // Allow cross-site cookies
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
    });

    // Success response with user data
    res.status(201).json({
      status: true,
      code: 201,
      message: "Email verified successfully! Your account has been created.",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        dob: newUser.dob,
        role: newUser.role,
        profileImage: newUser.profileImage,
      },
    });
  } catch (err) {
    console.error("OTP verification error:", err);

    // Handle duplicate email error (in case user was created between checks)
    if (err.code === 11000) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "This email is already registered. Please login instead.",
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
