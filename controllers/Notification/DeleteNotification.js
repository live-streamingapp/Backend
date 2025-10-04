import Notification from "../../model/NotificationModel.js";

// Delete a notification
export const deleteNotification = async (req, res) => {
	try {
		const notification = await Notification.findByIdAndDelete(req.params.id);

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
			message: "Notification deleted successfully",
			data: { id: req.params.id },
		});
	} catch (error) {
		console.error("Error deleting notification:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error deleting notification",
			error: error.message,
		});
	}
};

// Delete all notifications for a user
export const deleteAllNotifications = async (req, res) => {
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

		const result = await Notification.deleteMany({ userId });

		res.status(200).json({
			status: true,
			code: 200,
			message: "All notifications deleted successfully",
			data: {
				deletedCount: result.deletedCount,
			},
		});
	} catch (error) {
		console.error("Error deleting all notifications:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error deleting all notifications",
			error: error.message,
		});
	}
};
