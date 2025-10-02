import Banner from "../../model/BannerModel.js";
import cloudinary from "../../config/cloudinary.js";

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "banners", resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

export const updateBanner = async (req, res) => {
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

    let imageUrl = banner.image;
    let publicId = banner.cloudinary_id;

    if (req.file && req.file.buffer) {
      // Delete old image
      if (publicId) await cloudinary.uploader.destroy(publicId);

      // Upload new image
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    // Update fields
    banner.title = req.body.title || banner.title;
    banner.description = req.body.description || banner.description;
    banner.buttonText = req.body.buttonText || banner.buttonText;
    banner.background = req.body.background || banner.background;
    banner.image = imageUrl;
    banner.cloudinary_id = publicId;

    await banner.save();

    res.status(200).json({
      status: true,
      code: 200,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (err) {
    console.error("Error updating banner:", err);
    res.status(500).json({
      status: false,
      code: 500,
      message: "Error updating banner",
      error: err.message,
    });
  }
};
