import StudentBooking from "../../model/StudentBookingModel.js";

export const getStudentBookings = async (req, res, next) => {
	try {
		const { studentId } = req.query;

		// Build filter object
		const filter = {};
		if (studentId) {
			filter.student = studentId;
		}

		const bookings = await StudentBooking.find(filter)
			.populate({
				path: "student",
				select: "name email phone",
			})
			.populate({
				path: "course",
				select: "title price",
			})
			.sort({ sessionDate: -1, createdAt: -1 });

		return res.status(200).json({
			success: true,
			bookings,
		});
	} catch (error) {
		next(error);
	}
};
