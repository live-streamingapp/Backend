import StudentProgress from "../../model/StudentProgressModel.js";

export const getStudentProgress = async (req, res, next) => {
	try {
		const progressEntries = await StudentProgress.find()
			.populate({
				path: "student",
				select: "name email phone createdAt",
			})
			.populate({
				path: "course",
				select: "title",
			})
			.sort({ updatedAt: -1 });

		return res.status(200).json({
			success: true,
			progress: progressEntries,
		});
	} catch (error) {
		next(error);
	}
};
