import User from "../../model/UserModel.js";
import Course from "../../model/CourseModel.js";

// Get courses enrolled by a specific user
export const getEnrolledCourses = async (req, res) => {
	try {
		const userId = req.user?._id; // Get from auth middleware

		if (!userId) {
			return res.status(401).json({
				status: "false",
				code: "401",
				message: "User not authenticated",
				data: {},
			});
		}

		const user = await User.findById(userId).populate("enrolledCourses");

		if (!user) {
			return res.status(404).json({
				status: "false",
				code: "404",
				message: "User not found",
				data: {},
			});
		}

		res.status(200).json({
			status: "true",
			code: "200",
			message: "Enrolled courses fetched successfully",
			data: user.enrolledCourses || [],
		});
	} catch (error) {
		console.error("Error fetching enrolled courses:", error);
		res.status(500).json({
			status: "false",
			code: "500",
			message: "Failed to fetch enrolled courses",
			data: {},
			error: error.message,
		});
	}
};
