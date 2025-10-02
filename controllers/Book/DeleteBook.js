import Book from "../../model/BookModel.js";

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
