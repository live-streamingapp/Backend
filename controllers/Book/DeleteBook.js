import Book from "../../model/BookModel.js";
import cloudinary from "../../config/cloudinary.js";

export const deleteBook = async (req, res) => {
	try {
		const book = await Book.findByIdAndDelete(req.params.id);
		if (!book) {
			return res.status(404).json({
				status: false,
				code: 404,
				message: "Book not found",
				data: null,
			});
		}

		if (book.cloudinaryImageId) {
			try {
				await cloudinary.uploader.destroy(book.cloudinaryImageId);
			} catch (assetError) {
				console.warn(
					"Failed to remove book cover from Cloudinary:",
					assetError.message
				);
			}
		}

		res.status(200).json({
			status: true,
			code: 200,
			message: "Book deleted successfully",
			data: { id: req.params.id },
		});
	} catch (error) {
		console.error("Error deleting book:", error);
		res.status(500).json({
			status: false,
			code: 500,
			message: "Error deleting book",
			error: error.message,
		});
	}
};
