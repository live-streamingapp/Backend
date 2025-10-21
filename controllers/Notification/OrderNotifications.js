import Notification from "../../model/NotificationModel.js";
import User from "../../model/UserModel.js";

/**
 * Create notifications for order-related events
 */

// Notify user when order status changes
export const notifyOrderStatusChange = async (order, oldStatus, newStatus) => {
	try {
		if (!order || !order.user) {
			console.warn("No order or user provided for order status notification");
			return { success: false, message: "Order or user required" };
		}

		// Create user-friendly status messages
		const statusMessages = {
			pending: {
				title: "Order Received",
				message: `Your order #${order._id
					.toString()
					.slice(-8)} has been received and is being processed.`,
				priority: "medium",
			},
			accepted: {
				title: "Order Accepted",
				message: `Great news! Your order #${order._id
					.toString()
					.slice(-8)} has been accepted and will be processed shortly.`,
				priority: "high",
			},
			declined: {
				title: "Order Update",
				message: `Your order #${order._id
					.toString()
					.slice(-8)} requires attention. Please check your order details.`,
				priority: "high",
			},
			completed: {
				title: "Order Completed",
				message: `Your order #${order._id
					.toString()
					.slice(-8)} has been completed successfully! ${
					order.items.some((item) => item.itemType === "course")
						? "You can now access your enrolled courses."
						: ""
				}`,
				priority: "high",
			},
			cancelled: {
				title: "Order Cancelled",
				message: `Your order #${order._id
					.toString()
					.slice(-8)} has been cancelled.`,
				priority: "medium",
			},
		};

		const statusInfo = statusMessages[newStatus] || {
			title: "Order Status Updated",
			message: `Your order #${order._id
				.toString()
				.slice(-8)} status has been updated to ${newStatus}.`,
			priority: "medium",
		};

		const notification = await Notification.create({
			userId: order.user,
			title: statusInfo.title,
			message: statusInfo.message,
			path: `/orders/${order._id}`,
			type: "payment",
			priority: statusInfo.priority,
			metadata: {
				orderId: order._id,
				oldStatus,
				newStatus,
				orderTotal: order.totalAmount,
				eventType: "order_status_change",
			},
		});

		return {
			success: true,
			message: "Order status notification sent",
			notification,
		};
	} catch (error) {
		console.error("Error creating order status notification:", error);
		return { success: false, message: error.message };
	}
};

// Notify admin about new order
export const notifyAdminNewOrder = async (order) => {
	try {
		if (!order) {
			console.warn("No order provided for admin notification");
			return { success: false, message: "Order required" };
		}

		// Get all admin users
		const admins = await User.find({ role: "admin" }, "_id").lean();

		if (admins.length === 0) {
			console.log("No admin users found");
			return { success: true, message: "No admins to notify" };
		}

		const orderItemTypes = order.items
			.map((item) => item.itemType)
			.filter((value, index, self) => self.indexOf(value) === index)
			.join(", ");

		const notifications = admins.map((admin) => ({
			userId: admin._id,
			title: "New Order Received",
			message: `A new order #${order._id.toString().slice(-8)} for ₹${
				order.totalAmount
			} has been placed. Items: ${orderItemTypes}`,
			path: `/admin/orders/${order._id}`,
			type: "payment",
			priority: "high",
			metadata: {
				orderId: order._id,
				userId: order.user,
				totalAmount: order.totalAmount,
				itemCount: order.items.length,
				eventType: "new_order",
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `New order notifications sent to ${createdNotifications.length} admins`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating admin order notification:", error);
		return { success: false, message: error.message };
	}
};

// Notify admin about new booking (consultation)
export const notifyAdminNewBooking = async (order) => {
	try {
		if (!order) {
			console.warn("No order provided for booking notification");
			return { success: false, message: "Order required" };
		}

		// Check if order contains consultation/package items
		const consultationItems = order.items.filter(
			(item) => item.itemType === "package"
		);

		if (consultationItems.length === 0) {
			return { success: true, message: "No consultation items in order" };
		}

		// Get all admin users
		const admins = await User.find({ role: "admin" }, "_id").lean();

		if (admins.length === 0) {
			console.log("No admin users found");
			return { success: true, message: "No admins to notify" };
		}

		const bookingDetails = consultationItems
			.map((item) => {
				const details = item.packageDetails;
				return `${item.title} on ${new Date(
					details.scheduledDate
				).toLocaleDateString()} at ${details.scheduledTime}`;
			})
			.join(", ");

		const notifications = admins.map((admin) => ({
			userId: admin._id,
			title: "New Consultation Booking",
			message: `New consultation booking received: ${bookingDetails}`,
			path: `/admin/consultations`,
			type: "enquiry",
			priority: "high",
			metadata: {
				orderId: order._id,
				userId: order.user,
				totalAmount: order.totalAmount,
				consultationCount: consultationItems.length,
				eventType: "new_booking",
			},
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		return {
			success: true,
			message: `New booking notifications sent to ${createdNotifications.length} admins`,
			count: createdNotifications.length,
		};
	} catch (error) {
		console.error("Error creating admin booking notification:", error);
		return { success: false, message: error.message };
	}
};

export default {
	notifyOrderStatusChange,
	notifyAdminNewOrder,
	notifyAdminNewBooking,
};
