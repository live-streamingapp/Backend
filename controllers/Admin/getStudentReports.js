import StudentReport from "../../model/StudentReportModel.js";

export const getStudentReports = async (req, res, next) => {
	try {
		const { studentId } = req.query;

		// Build filter object
		const filter = {};
		if (studentId) {
			filter.student = studentId;
		}

		const reports = await StudentReport.find(filter)
			.populate({
				path: "student",
				select: "name email phone",
			})
			.sort({ downloadedAt: -1 });

		return res.status(200).json({
			success: true,
			reports,
		});
	} catch (error) {
		next(error);
	}
};
