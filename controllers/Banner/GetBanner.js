import Banner from "../../model/BannerModel.js";

// Get all banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (err) {
    console.error("Error fetching banners:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching banners",
      error: err.message,
    });
  }
};

// Get single banner by ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Banner not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      code: 200,
      message: "Banner fetched successfully",
      data: banner,
    });
  } catch (err) {
    console.error("Error fetching banner:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error fetching banner",
      error: err.message,
    });
  }
};
