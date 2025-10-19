import Blog from "../../model/BlogModel.js";
import cloudinary from "../../config/cloudinary.js";

// Upload file to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder) => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream({ folder, resource_type: "image" }, (error, result) => {
				if (error) reject(error);
				else resolve(result);
			})
			.end(fileBuffer);
	});
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
	if (!publicId) return;
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error("Error deleting from Cloudinary:", error);
	}
};

export const editBlog = async (req, res) => {
	try {
		const { title, tags, author, description, videoUrl, sections } = req.body;

		// Get existing blog to access old image IDs for cleanup
		const existingBlog = await Blog.findById(req.params.id);
		if (!existingBlog) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Blog not found",
				data: null,
			});
		}

		// Build update data object - only include fields that are provided
		let updatedData = {};

		if (title !== undefined) updatedData.title = title;
		if (description !== undefined) updatedData.description = description;
		if (author !== undefined) updatedData.author = author;
		if (tags !== undefined) updatedData.tags = tags;
		if (videoUrl !== undefined) updatedData.videoUrl = videoUrl;

		// Update main image if uploaded
		if (req.files?.mainImage?.[0]?.buffer) {
			// Delete old main image from Cloudinary
			if (existingBlog.cloudinary_main_image_id) {
				await deleteFromCloudinary(existingBlog.cloudinary_main_image_id);
			}

			// Upload new main image
			const result = await uploadToCloudinary(
				req.files.mainImage[0].buffer,
				"blogs"
			);
			updatedData.mainImage = result.secure_url;
			updatedData.cloudinary_main_image_id = result.public_id;
		}

		// Update sections
		if (sections) {
			let parsedSections =
				typeof sections === "string" ? JSON.parse(sections) : sections;

			// Upload new section images if provided
			if (req.files?.sectionImages && req.files.sectionImages.length > 0) {
				const uploadedSections = [];

				for (let i = 0; i < parsedSections.length; i++) {
					const section = parsedSections[i];
					const sectionImages = [];
					const cloudinaryImageIds = [];

					// Get all images for this section
					const sectionImageFiles = req.files.sectionImages.filter((file) => {
						return file.fieldname.includes(`[${i}]`);
					});

					// Upload each image for this section
					for (const file of sectionImageFiles) {
						if (file.buffer) {
							const result = await uploadToCloudinary(
								file.buffer,
								"blogs/sections"
							);
							sectionImages.push(result.secure_url);
							cloudinaryImageIds.push(result.public_id);
						}
					}

					uploadedSections.push({
						...section,
						images:
							sectionImages.length > 0 ? sectionImages : section.images || [],
						cloudinary_image_ids:
							cloudinaryImageIds.length > 0
								? cloudinaryImageIds
								: section.cloudinary_image_ids || [],
					});
				}

				parsedSections = uploadedSections;
			}

			updatedData.sections = parsedSections;
		}

		const blog = await Blog.findByIdAndUpdate(req.params.id, updatedData, {
			new: true,
		});

		res.status(200).json({
			status: true,
			code: 200,
			message: "Blog updated successfully",
			data: blog,
		});
	} catch (error) {
		console.error("Error updating blog:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error updating blog",
			error: error.message,
		});
	}
};
