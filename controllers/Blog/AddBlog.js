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

export const addBlog = async (req, res) => {
	try {
		const { title, tags, author, date, description, videoUrl, sections } =
			req.body;

		if (!title || !description) {
			return res.status(400).json({
				status: false,
				code: 400,
				message: "Title and description are required",
				data: null,
			});
		}

		let mainImage = "";
		let cloudinary_main_image_id = "";

		// Upload main image to Cloudinary
		if (req.files?.mainImage?.[0]?.buffer) {
			const result = await uploadToCloudinary(
				req.files.mainImage[0].buffer,
				"blogs"
			);
			mainImage = result.secure_url;
			cloudinary_main_image_id = result.public_id;
		}

		// Handle sections
		let parsedSections = [];
		if (sections) {
			// Sections will come as JSON string from frontend FormData
			parsedSections =
				typeof sections === "string" ? JSON.parse(sections) : sections;

			// Upload section images to Cloudinary
			if (req.files?.sectionImages && req.files.sectionImages.length > 0) {
				const uploadedSections = [];

				for (let i = 0; i < parsedSections.length; i++) {
					const section = parsedSections[i];
					const sectionImages = [];
					const cloudinaryImageIds = [];

					// Get all images for this section
					const sectionImageFiles = req.files.sectionImages.filter((file) => {
						// Match by field name pattern like sectionImages[0]
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
						cloudinary_image_ids: cloudinaryImageIds,
					});
				}

				parsedSections = uploadedSections;
			}
		}

		const blog = new Blog({
			title,
			tags,
			author,
			date,
			mainImage,
			cloudinary_main_image_id,
			description,
			videoUrl,
			sections: parsedSections,
		});

		await blog.save();

		res.status(201).json({
			status: true,
			code: 201,
			message: "Blog created successfully",
			data: blog,
		});
	} catch (error) {
		console.error("Error creating blog:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
