import Notification from "../../model/NotificationModel.js";

// Mark notification as read
export const markAsRead = async (req, res) => {
	try {
		const notification = await Notification.findByIdAndUpdate(
			req.params.id,
			{ isRead: true },
			{ new: true }
		);

		if (!notification) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Notification not found",
				data: null,
			});
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Notification marked as read",
			data: notification,
		});
	} catch (error) {
		console.error("Error marking notification as read:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error marking notification as read",
			error: error.message,
		});
	}
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
	try {
		const { userId } = req.body;

		if (!userId) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "User ID is required",
				data: null,
			});
		}

		const result = await Notification.updateMany(
			{ userId, isRead: false },
			{ isRead: true }
		);

		res.status(200).json({
			status: true,
			code: 200,
			message: "All notifications marked as read",
			data: {
				modifiedCount: result.modifiedCount,
			},
		});
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error marking all notifications as read",
			error: error.message,
		});
	}
};
