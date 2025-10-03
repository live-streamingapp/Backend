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

export const createEvent = async (req, res) => {
	try {
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

		const eventPayload = normaliseEventPayload(body, {
			createdBy: req.user?._id ?? body.createdBy ?? null,
		});

		if (req.file?.buffer) {
			const uploadResult = await streamUpload(req.file.buffer, "events");
			eventPayload.thumbnail = uploadResult.secure_url;
			eventPayload.thumbnailPublicId = uploadResult.public_id;
		}

		const event = new Event(eventPayload);

		await event.save();

		res.status(201).json({
			status: true,
			code: 201,
			message: "Event created successfully",
			data: event,
		});
	} catch (error) {
		console.error("Error creating event:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Failed to create event",
			error: error.message,
		});
	}
};
