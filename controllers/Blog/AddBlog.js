import Blog from "../../model/BlogModel.js";

export const addBlog = async (req, res) => {
  try {
    const { title, tags, author, date, description, sections } = req.body;

    if (!title || !author || !description) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "Title, author, and description are required",
        data: null,
      });
    }

    let mainImage = "";
    if (req.files?.mainImage) {
      mainImage = req.files.mainImage[0].path;
    }

    // Handle sections
    let parsedSections = [];
    if (sections) {
      // Sections will come as JSON string from frontend FormData
      parsedSections = sections;

      // Attach uploaded section images
      if (req.files?.sectionImages) {
        parsedSections = parsedSections.map((sec, idx) => ({
          ...sec,
          image: [req.files.sectionImages[idx]?.path || ""],
        }));
      }
    }

    const blog = new Blog({
      title,
      tags,
      author,
      date,
      mainImage,
      description,
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
