import StudentBooking from "../../model/StudentBookingModel.js";

export const getStudentBookings = async (req, res, next) => {
	try {
		const bookings = await StudentBooking.find()
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
