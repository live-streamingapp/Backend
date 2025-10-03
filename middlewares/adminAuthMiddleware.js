import jwt from "jsonwebtoken";
import User from "../model/UserModel.js";

export const adminMiddleware = async (req, res, next) => {
	try {
		const token = req.cookies?.token;
		if (!token) {
			return res
				.status(401)
				.json({ success: false, message: "Not authenticated" });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Fetch user from database to verify role
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		// Verify this is an admin or astrologer user
		if (user.role !== "admin" && user.role !== "astrologer") {
			return res
				.status(403)
				.json({
					success: false,
					message: "Access denied: Admins/Astrologers only",
				});
		}

		// Attach user info
		req.user = user;

		next();
	} catch (err) {
		res
			.status(401)
			.json({ success: false, message: "Invalid or expired token" });
	}
};
