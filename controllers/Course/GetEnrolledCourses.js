import User from "../../model/UserModel.js";
import Course from "../../model/CourseModel.js";
import StudentProgress from "../../model/StudentProgressModel.js";

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

		// Map per-student progress onto enrolled courses (fallback to 0)
		const courseIds = (user.enrolledCourses || []).map((c) => c._id);
		let progressByCourse = new Map();
		if (courseIds.length > 0) {
			const progresses = await StudentProgress.find({
				student: userId,
				course: { $in: courseIds },
			})
				.select("course progressPercent")
				.lean();
			progresses.forEach((p) => {
				progressByCourse.set(String(p.course), p.progressPercent ?? 0);
			});
		}

		const enriched = (user.enrolledCourses || []).map((c) => {
			const course = c.toObject ? c.toObject() : c;
			return {
				...course,
				progress: progressByCourse.get(String(course._id)) ?? 0,
			};
		});

		res.status(200).json({
			status: "true",
			code: "200",
			message: "Enrolled courses fetched successfully",
			data: enriched,
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
