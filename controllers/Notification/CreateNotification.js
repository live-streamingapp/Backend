import Notification from "../../model/NotificationModel.js";

export const createNotification = async (req, res) => {
	try {
		const { userId, title, message, path, type, priority, metadata } = req.body;

		if (!userId || !title || !message) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "User ID, title, and message are required",
				data: null,
			});
		}

		const notification = new Notification({
			userId,
			title,
			message,
			path,
			type,
			priority,
			metadata,
		});

		await notification.save();

		res.status(201).json({
			status: true,
			code: 201,
			message: "Notification created successfully",
			data: notification,
		});
	} catch (error) {
		console.error("Error creating notification:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error creating notification",
			error: error.message,
		});
	}
};

// Bulk create notifications (for multiple users)
export const createBulkNotifications = async (req, res) => {
	try {
		const { userIds, title, message, path, type, priority, metadata } =
			req.body;

		if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "User IDs array is required",
				data: null,
			});
		}

		if (!title || !message) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "Title and message are required",
				data: null,
			});
		}

		const notifications = userIds.map((userId) => ({
			userId,
			title,
			message,
			path,
			type,
			priority,
			metadata,
		}));

		const createdNotifications = await Notification.insertMany(notifications);

		res.status(201).json({
			status: true,
			code: 201,
			message: `${createdNotifications.length} notifications created successfully`,
			data: {
				count: createdNotifications.length,
				notifications: createdNotifications,
			},
		});
	} catch (error) {
		console.error("Error creating bulk notifications:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error creating bulk notifications",
			error: error.message,
		});
	}
};
