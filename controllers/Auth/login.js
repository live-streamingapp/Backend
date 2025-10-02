import User from "../../model/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email only
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "User not found",
        data: null,
      });
    }

    const generateToken = (id, role) => {
      return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "4h",
      });
    };
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Invalid email or password",
        data: null,
      });
    }

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
    res.status(200).json({
      status: true,
      code: 200,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
