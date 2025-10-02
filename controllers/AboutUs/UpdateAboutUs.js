import AboutUs from "../../model/AboutUsModel.js";

export const updateAboutUs = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    // Handle image upload
    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    // Update (or create if not exists)
    const updatedAbout = await AboutUs.findOneAndUpdate(
      {}, // match condition (empty means first/only doc)
      updatedData,
      { new: true, upsert: true }
    );

    if (!updatedAbout) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "About Us not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "About Us updated successfully",
      data: updatedAbout,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error updating About Us",
      error: error.message,
    });
  }
};
