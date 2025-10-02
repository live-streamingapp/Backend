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

export const createBanner = async (req, res) => {
  try {
    let imageUrl = null;
    let publicId = null;

    if (req.file && req.file.buffer) {
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const banner = new Banner({
      title: req.body.title,
      description: req.body.description,
      buttonText: req.body.buttonText || "Learn More",
      background: req.body.background || "#bb1401",
      image: imageUrl,
      cloudinary_id: publicId,
      createdBy: req.user?._id || null,
    });

    await banner.save();

    return res.status(201).json({
      status: true,
      code: 201,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (err) {
    console.error("Error creating banner:", err);
    return res.status(500).json({
      status: false,
      code: 500,
      message: "Error creating banner",
      error: err.message,
    });
  }
};
