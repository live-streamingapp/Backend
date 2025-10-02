import Book from "../../model/BookModel.js";

// Get all books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Books fetched successfully",
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching books",
      error: error.message,
    });
  }
};

// Get single book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
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
      message: "Book fetched successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching book",
      error: error.message,
    });
  }
};
