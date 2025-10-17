import StudentProgress from "../../model/StudentProgressModel.js";

export const getStudentReports = async (req, res, next) => {
	try {
		const { studentId } = req.query;

		// Build filter object - now get reports from StudentProgress model
		const filter = { "reportFields.reportGenerated": true };
		if (studentId) {
			filter.student = studentId;
		}

		const reports = await StudentProgress.find(filter)
			.populate({
				path: "student",
				select: "name email phone",
			})
			.populate({
				path: "course",
				select: "title description",
			})
			.sort({ "reportFields.reportGeneratedAt": -1 });

		// Transform data to match expected format
		const formattedReports = reports.map((progress) => ({
			_id: progress._id,
			student: progress.student,
			course: progress.course,
			report: `${progress.course?.title} - Progress Report`,
			level: progress.reportFields.reportLevel,
			fileUrl: progress.reportFields.reportUrl,
			downloadedAt: progress.reportFields.downloadedAt,
			uploadedBy: progress.reportFields.uploadedBy,
			reportGeneratedAt: progress.reportFields.reportGeneratedAt,
			progressPercent: progress.progressPercent,
			status: progress.status,
			reportData: progress.reportFields.reportData,
		}));

		return res.status(200).json({
			success: true,
			reports: formattedReports,
		});
	} catch (error) {
		next(error);
	}
};
