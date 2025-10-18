import Course from "../../model/CourseModel.js";
import User from "../../model/UserModel.js";

// GET /api/admin/courses/stats
// Returns aggregate stats for courses for admin dashboard
export const getCourseStats = async (req, res) => {
	try {
		// Total number of courses
		const totalCourses = await Course.countDocuments({});

		// Total enrollments across all users (sum of enrolledCourses length)
		const enrollmentAgg = await User.aggregate([
			{
				$project: {
					enrolledCount: { $size: { $ifNull: ["$enrolledCourses", []] } },
				},
			},
			{ $group: { _id: null, totalEnrollments: { $sum: "$enrolledCount" } } },
		]);

		const totalEnrollments = enrollmentAgg?.[0]?.totalEnrollments ?? 0;

		return res.status(200).json({
			status: true,
			code: 200,
			message: "Course stats fetched successfully",
			data: {
				totalCourses,
				totalEnrollments,
			},
		});
	} catch (error) {
		console.error("Error fetching course stats:", error);
		return res.status(500).json({
			status: false,
			code: 500,
			message: "Failed to fetch course stats",
			error: error.message,
		});
	}
};
