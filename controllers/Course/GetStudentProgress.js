import StudentProgress from "../../model/StudentProgressModel.js";

/**
 * Get student's progress for a specific course
 */
export const getStudentCourseProgress = async (req, res) => {
	try {
		const userId = req.user?._id;
		const { courseId } = req.params;

		if (!userId) {
			return res.status(401).json({
				status: "false",
				code: "401",
				message: "User not authenticated",
				data: {},
			});
		}

		if (!courseId) {
			return res.status(400).json({
				status: "false",
				code: "400",
				message: "Course ID is required",
				data: {},
			});
		}

		// Find or create progress record
		let progress = await StudentProgress.findOne({
			student: userId,
			course: courseId,
		}).lean();

		// If no progress exists, return default values
		if (!progress) {
			progress = {
				student: userId,
				course: courseId,
				videosCompleted: 0,
				videosTotal: 0,
				quizzesCompleted: 0,
				quizzesTotal: 0,
				progressPercent: 0,
				status: "On Track",
				sessionProgress: {
					totalSessions: 0,
					attendedSessions: 0,
					attendancePercentage: 0,
					sessionHistory: [],
				},
				reportFields: {
					reportGenerated: false,
				},
			};
		}

		res.status(200).json({
			status: "true",
			code: "200",
			message: "Course progress fetched successfully",
			data: progress,
		});
	} catch (error) {
		console.error("Error fetching student course progress:", error);
		res.status(500).json({
			status: "false",
			code: "500",
			message: "Failed to fetch course progress",
			data: {},
			error: error.message,
		});
	}
};
