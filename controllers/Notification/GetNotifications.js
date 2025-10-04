import Notification from "../../model/NotificationModel.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
	try {
		const { userId } = req.query;
		const { limit = 50, page = 1, isRead } = req.query;

		if (!userId) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "User ID is required",
				data: null,
			});
		}

		const query = { userId };

		// Filter by read status if provided
		if (isRead !== undefined) {
			query.isRead = isRead === "true";
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const notifications = await Notification.find(query)
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(skip)
			.lean();

		const total = await Notification.countDocuments(query);
		const unreadCount = await Notification.countDocuments({
			userId,
			isRead: false,
		});

		res.status(200).json({
			status: true,
			code: 200,
			message: "Notifications fetched successfully",
			data: {
				notifications,
				pagination: {
					total,
					page: parseInt(page),
					limit: parseInt(limit),
					totalPages: Math.ceil(total / parseInt(limit)),
				},
				unreadCount,
			},
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error fetching notifications",
			error: error.message,
		});
	}
};

// Get single notification by ID
export const getNotificationById = async (req, res) => {
	try {
		const notification = await Notification.findById(req.params.id);

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
			message: "Notification fetched successfully",
			data: notification,
		});
	} catch (error) {
		console.error("Error fetching notification:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error fetching notification",
			error: error.message,
		});
	}
};
