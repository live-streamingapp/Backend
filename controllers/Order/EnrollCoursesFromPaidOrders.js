import Order from "../../model/OrderModel.js";
import User from "../../model/UserModel.js";

/**
 * Retroactively enroll users in courses from already paid orders
 * This is a utility endpoint to fix existing orders
 */
export const enrollCoursesFromPaidOrders = async (req, res) => {
	try {
		// Find all paid orders or completed orders
		const paidOrders = await Order.find({
			$or: [{ paymentStatus: "paid" }, { status: "completed" }],
		});

		let enrolledCount = 0;
		let orderCount = 0;

		for (const order of paidOrders) {
			// Find course items in the order
			const courseItems = order.items.filter(
				(item) => item.itemType === "course"
			);

			if (courseItems.length === 0) {
				continue; // No courses in this order
			}

			// Get user
			const user = await User.findById(order.user);
			if (!user) {
				console.warn(`User not found for order: ${order._id}`);
				continue;
			}

			// Add course IDs to enrolledCourses (avoid duplicates)
			const courseIds = courseItems.map((item) => item.itemId.toString());
			const enrolledIds = user.enrolledCourses.map((id) => id.toString());

			const newCourses = courseIds.filter((id) => !enrolledIds.includes(id));

			if (newCourses.length > 0) {
				user.enrolledCourses.push(...newCourses);
				await user.save();
				enrolledCount += newCourses.length;
				orderCount++;
				console.log(
					`Enrolled user ${user.email} in ${newCourses.length} course(s) from order ${order.orderNumber}`
				);
			}
		}

		res.status(200).json({
			success: true,
			message: `Successfully enrolled courses from ${orderCount} order(s)`,
			data: {
				ordersProcessed: paidOrders.length,
				ordersWithNewEnrollments: orderCount,
				totalCoursesEnrolled: enrolledCount,
			},
		});
	} catch (error) {
		console.error("Error enrolling courses from paid orders:", error);
		res.status(500).json({
			success: false,
			message: "Failed to enroll courses",
			error: error.message,
		});
	}
};
