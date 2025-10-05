import Service from "../../model/ServiceModel.js";
import cloudinary from "../../config/cloudinary.js";

export const createService = async (req, res) => {
	try {
		const {
			title,
			description,
			price,
			originalPrice,
			category,
			features,
			serviceType,
			subCategory,
		} = req.body;

		// Parse features if it's a string
		let parsedFeatures = features;
		if (typeof features === "string") {
			try {
				parsedFeatures = JSON.parse(features);
			} catch (e) {
				parsedFeatures = features.split(",").map((f) => f.trim());
			}
		}

		let imageUrl = null;
		// Image is now optional
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
			imageUrl = result.secure_url;
		}

		const serviceData = {
			title,
			description,
			price,
			originalPrice: originalPrice || price,
			category,
			serviceType: serviceType || "service",
			features: parsedFeatures,
			createdBy: req.user._id,
		};

		// Add subCategory if provided
		if (subCategory) {
			serviceData.subCategory = subCategory;
		}

		// Only add image if it exists
		if (imageUrl) {
			serviceData.image = imageUrl;
		}

		const service = await Service.create(serviceData);

		res.status(201).json({
			success: true,
			message: "Service created successfully",
			data: service,
		});
	} catch (error) {
		console.error("Create service error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create service",
			error: error.message,
		});
	}
};
