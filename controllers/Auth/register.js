import User from "../../model/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "4h", // keep it shorter for security
  });
};

// ---------------- REGISTER ----------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, dob, password, confirmPassword, role } =
      req.body;

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

    // Validate passwords
    // if (password !== confirmPassword) {
    // 	return res.status(400).json({
    // 		status: false,
    // 		code: 400,
    // 		message: "Passwords do not match",
    // 		data: null,
    // 	});
    // }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Allow student or astrologer registration
    // Note: In this system, there should only be ONE astrologer (who is the admin)
    const userRole = role === "astrologer" ? "astrologer" : "student";

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      dob,
      password: hashPassword,
      role: userRole,
    });

    // Generate JWT
    const token = generateToken(user._id, user.role);

    // Store JWT in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Always true on Vercel (HTTPS enforced)
      sameSite: "none", // Allow cross-site cookies
      maxAge: 4 * 60 * 60 * 1000,
    });

    // Success response (no token in body)
    res.status(201).json({
      status: true,
      code: 201,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        role: user.role,
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
