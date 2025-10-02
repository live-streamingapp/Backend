import Blog from "../../model/BlogModel.js";

export const editBlog = async (req, res) => {
  try {
    const { title, tags, author, description, sections } = req.body;

    let updatedData = { title, tags, author, description };

    // Update main image if uploaded
    if (req.files?.mainImage) {
      updatedData.mainImage = req.files.mainImage[0].path;
    }

    // Update sections
    if (sections) {
      let parsedSections = JSON.parse(sections);
      if (req.files?.sectionImages) {
        parsedSections = parsedSections.map((sec, idx) => ({
          ...sec,
          image: [req.files.sectionImages[idx]?.path || ""],
        }));
      }
      updatedData.sections = parsedSections;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

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
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error updating blog",
      error: error.message,
    });
  }
};
