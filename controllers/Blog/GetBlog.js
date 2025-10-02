import Blog from "../../model/BlogModel.js";

// Get all blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      code: 200,
      message: "Blogs fetched successfully",
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
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

    res.status(200).json({
      status: true,
      code: 200,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};
