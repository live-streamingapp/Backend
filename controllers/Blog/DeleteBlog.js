import Blog from "../../model/BlogModel.js";

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Blog not found",
        data: null,
      });
    }

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
