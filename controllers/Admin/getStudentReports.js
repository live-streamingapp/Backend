import StudentReport from "../../model/StudentReportModel.js";

export const getStudentReports = async (req, res, next) => {
	try {
		const reports = await StudentReport.find()
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
