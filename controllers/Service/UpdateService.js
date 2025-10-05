import Service from "../../model/ServiceModel.js";
import cloudinary from "../../config/cloudinary.js";

export const updateService = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = { ...req.body };

		// Parse features if it's a string
		if (updateData.features && typeof updateData.features === "string") {
			try {
				updateData.features = JSON.parse(updateData.features);
			} catch (e) {
				updateData.features = updateData.features
					.split(",")
					.map((f) => f.trim());
			}
		}

		// Handle image upload
		if (req.files?.image?.[0]) {
			// Use upload stream for buffer-based uploads (memoryStorage)
			const file = req.files.image[0];
			const result = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{
						folder: "services",
						resource_type: "auto",
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				);
				uploadStream.end(file.buffer);
			});
			updateData.image = result.secure_url;
		}

		const service = await Service.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});

		if (!service) {
			return res.status(404).json({
				success: false,
				message: "Service not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Service updated successfully",
			data: service,
		});
	} catch (error) {
		console.error("Update service error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update service",
			error: error.message,
		});
	}
};
