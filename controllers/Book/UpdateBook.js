import Book from "../../model/BookModel.js";

export const updateBook = async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
    };

    if (req.file) {
      updatedData.coverImage = `/uploads/${req.file.filename}`;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
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
