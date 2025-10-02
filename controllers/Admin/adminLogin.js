import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  const admin = process.env.ADMIN_NAME;
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate token
      const token = jwt.sign(
        { role: "admin", email, admin },
        process.env.JWT_SECRET,
        { expiresIn: "4h" } // shorter expiry for security
      );

      // Store token in HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 4 * 60 * 60 * 1000, // 4 hours
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Admin login successful",
        data: {
          email,
          role: "admin",
        },
      });
    } else {
      return res.status(401).json({
        status: false,
        code: 401,
        message: "Invalid credentials",
        data: null,
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
