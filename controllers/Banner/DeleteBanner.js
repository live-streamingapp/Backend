import Banner from "../../model/BannerModel.js";
import cloudinary from "../../config/cloudinary.js";

export const deleteBanner = async (req, res) => {
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

    // Delete image from Cloudinary if exists
    if (banner.cloudinary_id) {
      await cloudinary.uploader.destroy(banner.cloudinary_id);
    }

    await banner.deleteOne();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Banner deleted successfully",
      data: { id: req.params.id },
    });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error deleting banner",
      error: err.message,
    });
  }
};
