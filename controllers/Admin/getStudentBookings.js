import Order from "../../model/OrderModel.js";

export const getStudentBookings = async (req, res, next) => {
	try {
		const { studentId } = req.query;

		// Build filter object - get course orders that are bookings
		const filter = {
			"items.itemType": "course",
			"items.courseDetails.isBooking": true,
		};
		if (studentId) {
			filter.user = studentId;
		}

		const bookings = await Order.find(filter)
			.populate({
				path: "user",
				select: "name email phone",
			})
			.populate({
				path: "items.itemId",
				select: "title description instructor",
			})
			.sort({ createdAt: -1 });

		// Transform data to match expected booking format
		const formattedBookings = bookings.flatMap((order) =>
			order.items
				.filter(
					(item) => item.itemType === "course" && item.courseDetails?.isBooking
				)
				.map((item) => ({
					_id: `${order._id}_${item._id}`,
					student: order.user,
					course: item.itemId,
					orderNumber: order.orderNumber,
					sessionDate: item.courseDetails.sessionDate,
					sessionTime: item.courseDetails.sessionTime,
					astrologerName: item.courseDetails.astrologerName,
					paymentAmount: item.price,
					payoutAmount: item.courseDetails.payoutAmount,
					paymentStatus:
						order.paymentStatus === "paid"
							? "Paid"
							: order.paymentStatus === "pending"
							? "Pending"
							: "Failed",
					bookingStatus: item.courseDetails.bookingStatus,
					avatar: item.courseDetails.avatar || order.user?.avatar,
					createdAt: order.createdAt,
					updatedAt: order.updatedAt,
				}))
		);

		return res.status(200).json({
			success: true,
			bookings: formattedBookings,
		});
	} catch (error) {
		next(error);
	}
};
