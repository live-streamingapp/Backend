import Order from "../../model/OrderModel.js";
import User from "../../model/UserModel.js";
import { notifyOrderStatusChange } from "../Notification/OrderNotifications.js";

export const updateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminNotes, trackingNumber } = req.body;

		const validStatuses = [
			"pending",
			"declined",
			"accepted",
			"completed",
			"cancelled",
		];

		if (status && !validStatuses.includes(status)) {
			return res.status(400).json({
				success: false,
				message: "Invalid status",
			});
		}

		const updateData = {};
		if (status) updateData.status = status;
		if (adminNotes) updateData.adminNotes = adminNotes;
		if (trackingNumber) updateData.trackingNumber = trackingNumber;

		// Add to status history
		const order = await Order.findById(id);
		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		const oldStatus = order.status;

		if (status) {
			order.statusHistory.push({
				status,
				updatedBy: req.user._id,
				timestamp: new Date(),
				notes: adminNotes,
			});
		}

		if (status === "completed") {
			updateData.deliveredAt = new Date();

			// Add purchased courses to user's enrolledCourses
			await enrollCoursesFromOrder(order);
		}

		Object.assign(order, updateData);
		await order.save();

		// Send notification to user about status change
		if (status && status !== oldStatus) {
			try {
				await notifyOrderStatusChange(order, oldStatus, status);
			} catch (notificationError) {
				console.error(
					"Error sending order status notification:",
					notificationError
				);
				// Don't fail the request if notification fails
			}
		}

		res.status(200).json({
			success: true,
			message: "Order updated successfully",
			data: order,
		});
	} catch (error) {
		console.error("Update order status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update order",
			error: error.message,
		});
	}
};

export const updatePaymentStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { paymentStatus, transactionId } = req.body;

		const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

		if (!validPaymentStatuses.includes(paymentStatus)) {
			return res.status(400).json({
				success: false,
				message: "Invalid payment status",
			});
		}

		const updateData = { paymentStatus };
		if (transactionId) updateData.transactionId = transactionId;
		if (paymentStatus === "paid") {
			updateData.paidAt = new Date();
		}

		const order = await Order.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Order not found",
			});
		}

		// When payment is marked as paid, enroll user in courses
		if (paymentStatus === "paid") {
			await enrollCoursesFromOrder(order);
		}

		res.status(200).json({
			success: true,
			message: "Payment status updated successfully",
			data: order,
		});
	} catch (error) {
		console.error("Update payment status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update payment status",
			error: error.message,
		});
	}
};

// Helper function to enroll user in purchased courses
async function enrollCoursesFromOrder(order) {
	try {
		// Find all course items in the order
		const courseItems = order.items.filter(
			(item) => item.itemType === "course"
		);

		if (courseItems.length === 0) {
			return; // No courses in this order
		}

		// Get user
		const user = await User.findById(order.user);
		if (!user) {
			console.error("User not found for order:", order._id);
			return;
		}

		// Add course IDs to enrolledCourses (avoid duplicates)
		const courseIds = courseItems.map((item) => item.itemId.toString());
		const enrolledIds = user.enrolledCourses.map((id) => id.toString());

		const newCourses = courseIds.filter((id) => !enrolledIds.includes(id));

		if (newCourses.length > 0) {
			user.enrolledCourses.push(...newCourses);
			await user.save();
			console.log(
				`Enrolled user ${user._id} in ${newCourses.length} course(s)`
			);
		}
	} catch (error) {
		console.error("Error enrolling courses from order:", error);
		// Don't throw - we don't want to break the order update
	}
}
