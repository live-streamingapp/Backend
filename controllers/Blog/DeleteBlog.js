import Blog from "../../model/BlogModel.js";
import cloudinary from "../../config/cloudinary.js";

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
	if (!publicId) return;
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		console.error("Error deleting from Cloudinary:", error);
	}
};

export const deleteBlog = async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id);
		if (!blog) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Blog not found",
				data: null,
			});
		}

		// Delete main image from Cloudinary
		if (blog.cloudinary_main_image_id) {
			await deleteFromCloudinary(blog.cloudinary_main_image_id);
		}

		// Delete section images from Cloudinary
		if (blog.sections && blog.sections.length > 0) {
			for (const section of blog.sections) {
				if (
					section.cloudinary_image_ids &&
					section.cloudinary_image_ids.length > 0
				) {
					for (const imageId of section.cloudinary_image_ids) {
						await deleteFromCloudinary(imageId);
					}
				}
			}
		}

		// Delete the blog document
		await Blog.findByIdAndDelete(req.params.id);

		res.status(200).json({
			status: true,
			code: 200,
			message: "Blog deleted successfully",
			data: { id: req.params.id },
		});
	} catch (error) {
		console.error("Error deleting blog:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error deleting blog",
			error: error.message,
		});
	}
};
