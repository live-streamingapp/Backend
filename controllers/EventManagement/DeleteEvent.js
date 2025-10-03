import Event from "../../model/EventModel.js";
import cloudinary from "../../config/cloudinary.js";

export const deleteEvent = async (req, res) => {
	try {
		const event = await Event.findByIdAndDelete(req.params.id);

		if (!event) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Event not found",
				data: null,
			});
		}

		if (event.thumbnailPublicId) {
			try {
				await cloudinary.uploader.destroy(event.thumbnailPublicId);
			} catch (assetError) {
				console.warn(
					"Failed to remove event thumbnail from Cloudinary:",
					assetError.message
				);
			}
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Event deleted successfully",
			data: event,
		});
	} catch (error) {
		console.error("Error deleting event:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Failed to delete event",
			error: error.message,
		});
	}
};
