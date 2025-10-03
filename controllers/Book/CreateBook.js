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

export const createBook = async (req, res) => {
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

		// Handle cover image upload to Cloudinary
		let coverImageUrl = null;
		let coverPublicId = null;

		if (req.file && req.file.buffer) {
			const result = await streamUpload(req.file.buffer, "books");
			coverImageUrl = result.secure_url;
			coverPublicId = result.public_id;
		}

		// Parse nested objects/arrays from FormData
		let languageOptions = [];
		let highlights = {};
		let keyFeatures = [];
		let targetAudience = [];

		if (body.languageOptions) {
			languageOptions =
				typeof body.languageOptions === "string"
					? JSON.parse(body.languageOptions)
					: body.languageOptions;
		}

		if (body.highlights) {
			highlights =
				typeof body.highlights === "string"
					? JSON.parse(body.highlights)
					: body.highlights;
		}

		if (body.keyFeatures) {
			keyFeatures =
				typeof body.keyFeatures === "string"
					? JSON.parse(body.keyFeatures)
					: body.keyFeatures;
		}

		if (body.targetAudience) {
			targetAudience =
				typeof body.targetAudience === "string"
					? JSON.parse(body.targetAudience)
					: body.targetAudience;
		}

		const newBook = new Book({
			title: body.title,
			description: body.description,
			price: body.price,
			stock: body.stock,
			languageOptions,
			highlights,
			keyFeatures,
			targetAudience,
			coverImage: coverImageUrl,
			cloudinaryImageId: coverPublicId,
		});

		await newBook.save();

		res.status(201).json({
			status: true,
			code: 201,
			message: "Book created successfully",
			data: newBook,
		});
	} catch (error) {
		console.error("Error creating book:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error creating book",
			error: error.message,
		});
	}
};
