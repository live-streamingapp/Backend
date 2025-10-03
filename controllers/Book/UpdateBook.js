import Book from "../../model/BookModel.js";
import cloudinary from "../../config/cloudinary.js";

const streamUpload = (buffer, folder = "books") => {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ folder, resource_type: "image" },
			(error, result) => {
				if (result) resolve(result);
				else reject(error);
			}
		);
		stream.end(buffer);
	});
};

const parseMaybeJson = (value, fallback) => {
	if (!value) return fallback;
	if (typeof value === "object") return value;
	try {
		return JSON.parse(value);
	} catch (error) {
		return fallback;
	}
};

export const updateBook = async (req, res) => {
	try {
		let body = req.body ?? {};
		if (req.body?.payload) {
			try {
				body = JSON.parse(req.body.payload);
			} catch (error) {
				return res.status(400).json({
					status: false,
					code: 400,
					message: "Invalid book payload provided.",
					error: error.message,
				});
			}
		}

		const existingBook = await Book.findById(req.params.id);
		if (!existingBook) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Book not found",
				data: null,
			});
		}

		const languageOptions = parseMaybeJson(body.languageOptions, []);
		const highlights = parseMaybeJson(body.highlights, {});
		const keyFeatures = parseMaybeJson(body.keyFeatures, []);
		const targetAudience = parseMaybeJson(body.targetAudience, []);

		const updatedData = {
			title: body.title ?? existingBook.title,
			description: body.description ?? existingBook.description,
			price: body.price ?? existingBook.price,
			languageOptions,
			highlights,
			keyFeatures,
			targetAudience,
			updatedAt: new Date(),
		};

		if (body.coverImage) {
			updatedData.coverImage = body.coverImage;
		}

		if (req.file?.buffer) {
			if (existingBook.cloudinaryImageId) {
				await cloudinary.uploader.destroy(existingBook.cloudinaryImageId);
			}

			const uploadResult = await streamUpload(req.file.buffer, "books");
			updatedData.coverImage = uploadResult.secure_url;
			updatedData.cloudinaryImageId = uploadResult.public_id;
		}

		const updatedBook = await Book.findByIdAndUpdate(
			req.params.id,
			updatedData,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!updatedBook) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Book not found",
				data: null,
			});
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Book updated successfully",
			data: updatedBook,
		});
	} catch (error) {
		console.error("Error updating book:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error updating book",
			error: error.message,
		});
	}
};
