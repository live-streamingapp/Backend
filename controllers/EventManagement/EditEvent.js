import Event from "../../model/EventModel.js";
import cloudinary from "../../config/cloudinary.js";
import { normaliseEventPayload } from "../../utils/eventPayload.js";

const streamUpload = (buffer, folder = "events") =>
	new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ folder, resource_type: "image" },
			(error, result) => {
				if (result) resolve(result);
				else reject(error);
			}
		);
		stream.end(buffer);
	});

export const updateEvent = async (req, res) => {
	try {
		const existingEvent = await Event.findById(req.params.id);

		if (!existingEvent) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Event not found",
				data: null,
			});
		}

		let body = req.body ?? {};
		if (req.body?.payload) {
			try {
				body = JSON.parse(req.body.payload);
			} catch (error) {
				return res.status(400).json({
					status: false,
					code: 400,
					message: "Invalid event payload provided.",
					error: error.message,
				});
			}
		}

		const payload = normaliseEventPayload(body, existingEvent.toObject());
		payload.updatedAt = new Date();

		if (req.file?.buffer) {
			if (existingEvent.thumbnailPublicId) {
				await cloudinary.uploader.destroy(existingEvent.thumbnailPublicId);
			}
			const uploadResult = await streamUpload(req.file.buffer, "events");
			payload.thumbnail = uploadResult.secure_url;
			payload.thumbnailPublicId = uploadResult.public_id;
		}

		const event = await Event.findByIdAndUpdate(req.params.id, payload, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			status: true,
			code: 200,
			message: "Event updated successfully",
			data: event,
		});
	} catch (error) {
		console.error("Error updating event:", error);
		res.status(400).json({
			status: false,
			code: 400,
			message: "Failed to update event",
			error: error.message,
		});
	}
};
