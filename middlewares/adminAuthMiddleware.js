import jwt from "jsonwebtoken";

export const adminMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure token belongs to the hardcoded admin
    if (decoded.role !== "admin" || decoded.email !== process.env.ADMIN_EMAIL) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Admins only" });
    }

    // Attach admin info (optional)
    req.admin = { email: decoded.email, role: decoded.role };

    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
