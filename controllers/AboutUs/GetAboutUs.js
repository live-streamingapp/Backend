import AboutUs from "../../model/AboutUsModel.js";

export const getAboutUs = async (req, res) => {
  try {
    const about = await AboutUs.find();

    res.status(200).json({
      status: true,
      code: 200,
      message: "About Us fetched successfully",
      data: about,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching About Us",
      error: error.message,
    });
  }
};
